const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://uhkfmppomxibrwhtaxsg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVoa2ZtcHBvbXhpYnJ3aHRheHNnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMTA5ODEsImV4cCI6MjA4MTY4Njk4MX0.oy4e5s-jVOUXp0b2qM9FpMClrQ3jUsbYIfGNYVuhc6Q';
const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestAccount() {
  const email = \`test\${Date.now()}@example.com\`;
  const password = 'testpassword123';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) {
    console.error('Error creating account:', error.message);
  } else {
    console.log('Successfully created test account!');
    console.log('Email:', email);
    console.log('Password:', password);
  }
}

createTestAccount();
