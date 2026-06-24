
import React from 'react';
import { BenchmarkDataView } from '@/components/gdft/components/ui/BenchmarkDataView';
import { Button } from '@/components/gdft/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BenchmarkData = () => {
    const navigate = useNavigate();

    return (
        <div className="page-container page-transition bg-gym-darker min-h-screen">
            <div className="flex items-center gap-3 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate('/exercises')}>
                    <ArrowLeft className="h-6 w-6 text-white" />
                </Button>
                <div>
                    <h1 className="text-3xl font-bold text-white">Benchmark Data</h1>
                    <p className="text-gray-400 text-sm">Set your targets and default values for every exercise</p>
                </div>
            </div>

            <div className="h-[calc(100vh-180px)]">
                <BenchmarkDataView hideHeader={true} />
            </div>
        </div>
    );
};

export default BenchmarkData;
