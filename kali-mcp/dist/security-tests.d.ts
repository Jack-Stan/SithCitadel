export interface TestResult {
    tool: string;
    target: string;
    timestamp: string;
    status: 'VULNERABLE' | 'SAFE' | 'WARNING' | 'ERROR';
    details: string;
    recommendations?: string[];
}
export declare class ShieldSecurityTester {
    private environment;
    private baseUrl;
    private apiKey?;
    constructor(baseUrl: string, environment?: 'local' | 'live', apiKey?: string);
    runNetworkScan(target: string): Promise<TestResult>;
    testSqlInjection(endpoint: string, param: string): Promise<TestResult>;
    testXSS(endpoint: string, param: string): Promise<TestResult>;
    testAuthBypass(loginEndpoint: string, credentials: {
        username: string;
        password: string;
    }): Promise<TestResult>;
    testOwasp(domain: string): Promise<TestResult>;
    testIDOR(endpoint: string, idParam?: string): Promise<TestResult>;
    testRateLimiting(endpoint: string, attempts?: number): Promise<TestResult>;
    testCORS(endpoint: string): Promise<TestResult>;
    testSecurityHeaders(endpoint: string): Promise<TestResult>;
    testDependencies(projectPath: string): Promise<TestResult>;
    runFullScan(endpoints: string[]): Promise<TestResult[]>;
}
//# sourceMappingURL=security-tests.d.ts.map