
async function testEndpoint(url: string, method: string = 'GET', body?: any) {
    try {
        const options: RequestInit = {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(`http://127.0.0.1:3002${url}`, options);

        console.log(`Testing ${method} ${url}...`);
        if (response.status === 401) {
            console.log(`✅ PASSED: Access denied (401) as expected.`);
        } else {
            console.log(`❌ FAILED: Expected 401, got ${response.status}`);
        }
    } catch (error) {
        console.error(`❌ ERROR: Could not connect to ${url}`, error);
    }
}

async function runTests() {
    console.log('Starting Security Verification...');

    // Test Users API
    await testEndpoint('/api/users');
    await testEndpoint('/api/users', 'POST', { login: 'test', password: 'password' });

    // Test Students API
    await testEndpoint('/api/students');

    // Test Schedule API
    await testEndpoint('/api/schedule');

    // Test Groups API
    await testEndpoint('/api/groups');

    // Test Dashboard Stats
    await testEndpoint('/api/dashboard/stats');

    console.log('Verification Complete.');
}

runTests();
