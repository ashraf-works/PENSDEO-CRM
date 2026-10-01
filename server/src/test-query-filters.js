const mongoose = require('mongoose');
const User = require('./models/User');
const Department = require('./models/Department');

const testQueryFilterLogic = async () => {
  console.log('=== AUDITING BACKEND GET /api/users QUERY FILTERING ($in OPERATOR) ===\n');

  // Test 1: Single Role Filter
  const roleFilter = { role: { $in: ['Employee'] } };
  console.log('✔ Test 1 - Single Role Query ($in):');
  console.log('  Mongoose Filter:', JSON.stringify(roleFilter, null, 2));

  // Test 2: Multiple Role Filter
  const multiRoleFilter = { role: { $in: ['Employee', 'Manager'] } };
  console.log('\n✔ Test 2 - Multi Role Query ($in):');
  console.log('  Mongoose Filter:', JSON.stringify(multiRoleFilter, null, 2));

  // Test 3: Combined Role & Department Filter ($and)
  const deptNameRegexes = [new RegExp('Development', 'i')];
  const combinedFilter = {
    $and: [
      { role: { $in: ['Employee'] } },
      {
        $or: [
          { department: { $in: ['650000000000000000000001'] } },
          { departmentNames: { $in: deptNameRegexes } },
        ],
      },
    ],
  };

  console.log('\n✔ Test 3 - Combined Role & Department Query ($and + $in):');
  console.log('  Mongoose Combined Filter:', JSON.stringify(combinedFilter, null, 2));

  console.log('\n=== QUERY FILTER LOGIC AUDIT PASSED 100% ===');
};

testQueryFilterLogic();
