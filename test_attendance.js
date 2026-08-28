import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://enabnigkoggxjsydidki.supabase.co';
const supabaseAnonKey = 'sb_publishable_7BxxktcW10XMVc4-BsJIrQ_l7_KM_SU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testAttendance() {
  const { data: emps } = await supabase.from('employees').select('id, employee_id, first_name');
  console.log('Available employees in DB:', emps?.slice(0, 3));

  if (!emps || emps.length === 0) return;

  const targetEmp = emps[0];
  const newLog = {
    id: 'e1000000-0000-4000-8000-000000000099',
    employee_id: targetEmp.id,
    date: '2026-08-28',
    time_in: '07:00',
    time_out: '17:00',
    regular_hours: 8,
    overtime_hours: 0,
    night_diff_hours: 0,
    late_minutes: 0,
    status: 'Present',
    notes: 'Test record'
  };

  console.log('Inserting attendance into Supabase...');
  const { data, error } = await supabase.from('attendance').upsert([newLog], { onConflict: 'employee_id,date' }).select();
  if (error) {
    console.error('Attendance Error:', error);
  } else {
    console.log('Attendance Success:', data);
  }
}

testAttendance();
