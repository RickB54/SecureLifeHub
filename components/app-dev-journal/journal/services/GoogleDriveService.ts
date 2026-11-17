// @ts-nocheck
import { GoogleOAuthProvider } from '@react-oauth/google';

const FOLDER_NAME = 'AppDevJournal';
const MIME_TYPE = 'application/json';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

class GoogleDriveService {
  private static instance: GoogleDriveService;
  private accessToken: string | null = null;
  private folderId: string | null = null;
  private email: string | null = null;

  private constructor() {}

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  async initialize(token: string) {
    try {
      this.accessToken = token;
      
      // Get user email for verification
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userData = await userResponse.json();
      this.email = userData.email;

      await this.ensureAppFolder();
      return this.email;
    } catch (error) {
      console.error('Failed to initialize Google Drive service:', error);
      throw error;
    }
  }

  getEmail(): string | null {
    return this.email;
  }

  private async retryOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
    let lastError: Error | null = null;
    
    for (let i = 0; i < retries; i++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        // Check for specific OAuth errors
        if (error.message?.includes('401') || error.message?.includes('invalid_client')) {
          throw new Error('OAuth authentication failed. Please try again or use a different account.');
        }
        
        if (i < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * Math.pow(2, i)));
        }
      }
    }
    
    throw lastError || new Error('Operation failed after retries');
  }

  private async ensureAppFolder() {
    try {
      await this.retryOperation(async () => {
        // Check if folder exists
        const response = await fetch(
          `https://www.googleapis.com/drive/v3/files?q=name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
          {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to check folder: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.files && data.files.length > 0) {
          this.folderId = data.files[0].id;
        } else {
          // Create folder if it doesn't exist
          const createResponse = await fetch('https://www.googleapis.com/drive/v3/files', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: FOLDER_NAME,
              mimeType: 'application/vnd.google-apps.folder',
            }),
          });

          if (!createResponse.ok) {
            throw new Error(`Failed to create folder: ${createResponse.statusText}`);
          }

          const folder = await createResponse.json();
          this.folderId = folder.id;
        }
      });
    } catch (error) {
      console.error('Error ensuring app folder:', error);
      throw error;
    }
  }

  async backup(data: any) {
    if (!this.accessToken || !this.folderId) {
      throw new Error('Not initialized');
    }

    return await this.retryOperation(async () => {
      const fileName = `backup_${new Date().toISOString().split('T')[0]}.json`;
      const fileContent = JSON.stringify(data);

      const metadata = {
        name: fileName,
        parents: [this.folderId],
        mimeType: MIME_TYPE,
      };

      const form = new FormData();
      form.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      form.append('file', new Blob([fileContent], { type: MIME_TYPE }));

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
          body: form,
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to upload backup: ${response.statusText}`);
      }

      return await response.json();
    });
  }

  async restore() {
    if (!this.accessToken || !this.folderId) {
      throw new Error('Not initialized');
    }

    return await this.retryOperation(async () => {
      // Get list of backups
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${this.folderId}' in parents and mimeType='${MIME_TYPE}' and trashed=false&orderBy=createdTime desc`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to list backups: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.files || data.files.length === 0) {
        throw new Error('No backups found');
      }

      // Get latest backup
      const latestBackup = data.files[0];
      const fileResponse = await fetch(
        `https://www.googleapis.com/drive/v3/files/${latestBackup.id}?alt=media`,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
          },
        }
      );

      if (!fileResponse.ok) {
        throw new Error(`Failed to fetch backup: ${fileResponse.statusText}`);
      }

      return await fileResponse.json();
    });
  }
}

export default GoogleDriveService;