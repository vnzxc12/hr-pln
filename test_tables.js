import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enabnigkoggxjsydidki.supabase.co';
const supabaseAnonKey = 'sb_publishable_7BxxktcW10XMVc4-BsJIrQ_l7_KM_SU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testTables() {
  const { data: depts } = await supabase.from('departments').select('*');
  const { data: desigs } = await supabase.from('designations').select('*');
  const { data: emps } = await supabase.from('employees').select('id, employee_id, first_name, last_name, department_id, designation_id');

  console.log('Departments in DB:');
  console.log(depts?.map(d => ({ id: d.id, name: d.name, code: d.code })));

  console.log('\nDesignations in DB:');
  console.log(desigs?.map(d => ({ id: d.id, title: d.title, dept_id: d.department_id, cat: d.workforce_category })));

  console.log('\nEmployees in DB:');
  console.log(emps);
}

testTables();
