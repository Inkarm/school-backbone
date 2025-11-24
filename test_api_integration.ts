async function main() {
    const baseUrl = 'http://localhost:3000';

    try {
        console.log('1. Fetching students...');
        const studentsRes = await fetch(`${baseUrl}/api/students`);
        if (!studentsRes.ok) throw new Error(`Failed to fetch students: ${studentsRes.status}`);
        const students = await studentsRes.json();
        if (students.length === 0) throw new Error('No students found');
        const student = students[0];
        console.log(`   Student: ${student.firstName} ${student.lastName} (ID: ${student.id})`);

        console.log('2. Fetching groups...');
        const groupsRes = await fetch(`${baseUrl}/api/groups`);
        if (!groupsRes.ok) throw new Error(`Failed to fetch groups: ${groupsRes.status}`);
        const groups = await groupsRes.json();
        if (groups.length === 0) throw new Error('No groups found');
        const group = groups[0];
        console.log(`   Group: ${group.name} (ID: ${group.id})`);

        console.log('3. Testing Assign Group to Student API...');
        const assignRes = await fetch(`${baseUrl}/api/students/${student.id}/groups`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: group.id })
        });

        const assignData = await assignRes.json();
        if (!assignRes.ok) {
            console.error('   FAILED:', assignData);
        } else {
            console.log('   SUCCESS:', assignData);
        }

        console.log('4. Testing Remove Group from Student API...');
        const removeRes = await fetch(`${baseUrl}/api/students/${student.id}/groups`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: group.id })
        });

        const removeData = await removeRes.json();
        if (!removeRes.ok) {
            console.error('   FAILED:', removeData);
        } else {
            console.log('   SUCCESS:', removeData);
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

main();
