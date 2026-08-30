import type {
  AnalyticsSummary,
  CountryAnalytics,
  Currency,
  DepartmentAnalytics,
  Employee,
  EmployeeFilterParams,
  EmployeeStatus,
  EmploymentType,
  PaginatedResponse,
  SalaryHistoryItem,
} from './types';
import { convertCurrency, getExchangeRate } from './utils';

// Departments
export const DEPARTMENTS = [
  'Engineering',
  'Sales',
  'Product',
  'Marketing',
  'Operations',
  'Human Resources',
  'Finance',
  'Legal',
  'Customer Support',
  'Design',
] as const;

// Locations & native currencies
export const LOCATIONS = [
  { country: 'United States', city: 'San Francisco', currency: 'USD', baseMultiplier: 1.0 },
  { country: 'United States', city: 'New York', currency: 'USD', baseMultiplier: 0.98 },
  { country: 'United States', city: 'Austin', currency: 'USD', baseMultiplier: 0.88 },
  { country: 'United Kingdom', city: 'London', currency: 'GBP', baseMultiplier: 0.85 },
  { country: 'United Kingdom', city: 'Manchester', currency: 'GBP', baseMultiplier: 0.75 },
  { country: 'Germany', city: 'Berlin', currency: 'EUR', baseMultiplier: 0.82 },
  { country: 'Germany', city: 'Munich', currency: 'EUR', baseMultiplier: 0.86 },
  { country: 'Canada', city: 'Toronto', currency: 'CAD', baseMultiplier: 0.8 },
  { country: 'Canada', city: 'Vancouver', currency: 'CAD', baseMultiplier: 0.78 },
  { country: 'Nigeria', city: 'Lagos', currency: 'NGN', baseMultiplier: 0.65 },
  { country: 'Australia', city: 'Sydney', currency: 'AUD', baseMultiplier: 0.85 },
  { country: 'Singapore', city: 'Singapore', currency: 'SGD', baseMultiplier: 0.9 },
] as const;

const FIRST_NAMES = [
  'James', 'Mary', 'Robert', 'Patricia', 'John', 'Jennifer', 'Michael', 'Linda', 'David', 'Elizabeth',
  'William', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen',
  'Christopher', 'Nancy', 'Daniel', 'Lisa', 'Matthew', 'Betty', 'Anthony', 'Margaret', 'Mark', 'Sandra',
  'Donald', 'Ashley', 'Steven', 'Kimberly', 'Paul', 'Emily', 'Andrew', 'Donna', 'Joshua', 'Michelle',
  'Kenneth', 'Dorothy', 'Kevin', 'Carol', 'Brian', 'Amanda', 'George', 'Melissa', 'Timothy', 'Deborah',
  'Alexander', 'Stephanie', 'Alex', 'Amara', 'Liam', 'Elena', 'Kofi', 'Fatima', 'Takeshi', 'Chioma',
  'Mateo', 'Sofia', 'Lucas', 'Chloe', 'Noah', 'Mia', 'Aarav', 'Priya', 'Hans', 'Greta',
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
  'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores',
  'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts',
  'Okonkwo', 'Adeyemi', 'Mueller', 'Schmidt', 'Tanaka', 'Dubois', 'Silva', 'Kowalski', 'O\'Connor', 'Nakamura',
];

const TITLES_BY_DEPT: Record<string, string[]> = {
  Engineering: ['Software Engineer', 'Senior Software Engineer', 'Staff Engineer', 'Engineering Manager', 'DevOps Engineer', 'QA Lead', 'Frontend Architect', 'Backend Developer', 'Principal Engineer'],
  Sales: ['Account Executive', 'Senior Account Executive', 'Sales Director', 'Business Development Rep', 'Enterprise Sales Lead', 'Sales Operations Specialist'],
  Product: ['Product Manager', 'Senior Product Manager', 'VP of Product', 'Technical Product Specialist', 'Product Owner', 'Associate PM'],
  Marketing: ['Growth Marketer', 'Content Strategist', 'SEO Specialist', 'Brand Manager', 'VP of Marketing', 'Marketing Analyst'],
  Operations: ['Operations Manager', 'Supply Chain Analyst', 'Director of Operations', 'Logistics Specialist', 'Procurement Lead'],
  'Human Resources': ['HR Generalist', 'People Partner', 'Talent Acquisition Lead', 'Director of People', 'HR Operations Analyst'],
  Finance: ['Financial Analyst', 'Senior Accountant', 'Controller', 'VP of Finance', 'Payroll Specialist', 'Auditor'],
  Legal: ['Corporate Counsel', 'Senior Legal Specialist', 'Compliance Officer', 'General Counsel'],
  'Customer Support': ['Support Specialist', 'Customer Success Manager', 'Support Team Lead', 'Implementation Specialist'],
  Design: ['Product Designer', 'Senior UI/UX Designer', 'Brand Designer', 'Design Systems Lead', 'Design Director'],
};

// Deterministic Pseudo-Random Number Generator (PRNG)
function createPRNG(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

let mockEmployeesCache: Employee[] | null = null;
const mockSalaryHistoryCache: Map<string, SalaryHistoryItem[]> = new Map();

export function getDeterministicMockEmployees(totalCount = 10000): Employee[] {
  if (mockEmployeesCache && mockEmployeesCache.length === totalCount) {
    return mockEmployeesCache;
  }

  const rng = createPRNG(42);
  const employees: Employee[] = [];

  // Handcrafted curated first 10 employees matching design mockups precisely
  const initialCurated: Partial<Employee>[] = [
    {
      id: 'EMP-00101',
      name: 'Eleanor Vance',
      email: 'eleanor.vance@acme.corp',
      job_title: 'Senior Software Engineer',
      department: 'Engineering',
      country: 'United States',
      city: 'San Francisco',
      currency: 'USD',
      base_salary: 165000,
      bonus: 25000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2021-03-15',
    },
    {
      id: 'EMP-00102',
      name: 'Oliver Thorne',
      email: 'oliver.thorne@acme.corp',
      job_title: 'Engineering Manager',
      department: 'Engineering',
      country: 'United Kingdom',
      city: 'London',
      currency: 'GBP',
      base_salary: 110000,
      bonus: 15000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2020-07-01',
    },
    {
      id: 'EMP-00103',
      name: 'Clara Oswald',
      email: 'clara.oswald@acme.corp',
      job_title: 'Staff Product Designer',
      department: 'Design',
      country: 'Germany',
      city: 'Berlin',
      currency: 'EUR',
      base_salary: 92000,
      bonus: 8000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2022-01-10',
    },
    {
      id: 'EMP-00104',
      name: 'Marcus Brody',
      email: 'marcus.brody@acme.corp',
      job_title: 'Director of Marketing',
      department: 'Marketing',
      country: 'United States',
      city: 'New York',
      currency: 'USD',
      base_salary: 185000,
      bonus: 30000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2019-11-20',
    },
    {
      id: 'EMP-00105',
      name: 'Amina Bello',
      email: 'amina.bello@acme.corp',
      job_title: 'Technical Support Lead',
      department: 'Customer Support',
      country: 'Nigeria',
      city: 'Lagos',
      currency: 'NGN',
      base_salary: 18000000,
      bonus: 2000000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2023-04-12',
    },
    {
      id: 'EMP-00106',
      name: 'Liam Chen',
      email: 'liam.chen@acme.corp',
      job_title: 'Frontend Architect',
      department: 'Engineering',
      country: 'Canada',
      city: 'Toronto',
      currency: 'CAD',
      base_salary: 145000,
      bonus: 12000,
      employment_type: 'Full-time',
      status: 'On Leave',
      start_date: '2022-08-01',
    },
    {
      id: 'EMP-00107',
      name: 'Sophie Dubois',
      email: 'sophie.dubois@acme.corp',
      job_title: 'Enterprise Account Executive',
      department: 'Sales',
      country: 'Germany',
      city: 'Munich',
      currency: 'EUR',
      base_salary: 105000,
      bonus: 45000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2021-09-15',
    },
    {
      id: 'EMP-00108',
      name: 'Hiroshi Tanaka',
      email: 'hiroshi.tanaka@acme.corp',
      job_title: 'VP of Product',
      department: 'Product',
      country: 'Singapore',
      city: 'Singapore',
      currency: 'SGD',
      base_salary: 210000,
      bonus: 40000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2018-05-10',
    },
    {
      id: 'EMP-00109',
      name: 'Grace Hopper',
      email: 'grace.hopper@acme.corp',
      job_title: 'Principal Systems Architect',
      department: 'Engineering',
      country: 'United States',
      city: 'Austin',
      currency: 'USD',
      base_salary: 195000,
      bonus: 35000,
      employment_type: 'Full-time',
      status: 'Active',
      start_date: '2017-02-14',
    },
    {
      id: 'EMP-00110',
      name: 'David Miller',
      email: 'david.miller@acme.corp',
      job_title: 'Contract Legal Specialist',
      department: 'Legal',
      country: 'United Kingdom',
      city: 'Manchester',
      currency: 'GBP',
      base_salary: 68000,
      bonus: 0,
      employment_type: 'Contractor',
      status: 'Terminated',
      start_date: '2023-01-15',
    },
  ];

  initialCurated.forEach((emp, i) => {
    const salaryUSD = Math.round((emp.base_salary! + emp.bonus!) * getExchangeRate(emp.currency!, 'USD'));
    const fullEmp: Employee = {
      id: emp.id!,
      name: emp.name!,
      email: emp.email!,
      job_title: emp.job_title!,
      department: emp.department!,
      country: emp.country!,
      city: emp.city!,
      currency: emp.currency!,
      base_salary: emp.base_salary!,
      bonus: emp.bonus!,
      salary_usd: salaryUSD,
      employment_type: emp.employment_type as EmploymentType,
      status: emp.status as EmployeeStatus,
      start_date: emp.start_date!,
      created_at: new Date(Date.now() - (1000 - i) * 86400000).toISOString(),
      updated_at: new Date(Date.now() - (100 - i) * 86400000).toISOString(),
    };
    employees.push(fullEmp);
  });

  const statuses: EmployeeStatus[] = ['Active', 'Active', 'Active', 'Active', 'Active', 'Active', 'On Leave', 'Terminated'];
  const employmentTypes: EmploymentType[] = ['Full-time', 'Full-time', 'Full-time', 'Full-time', 'Part-time', 'Contractor'];

  for (let i = employees.length; i < totalCount; i++) {
    const firstName = FIRST_NAMES[Math.floor(rng() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(rng() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i % 7 === 0 ? i : ''}@acme.corp`;

    const dept = DEPARTMENTS[Math.floor(rng() * DEPARTMENTS.length)];
    const titles = TITLES_BY_DEPT[dept] || ['Specialist'];
    const job_title = titles[Math.floor(rng() * titles.length)];

    const loc = LOCATIONS[Math.floor(rng() * LOCATIONS.length)];
    const status = statuses[Math.floor(rng() * statuses.length)];
    const employment_type = employmentTypes[Math.floor(rng() * employmentTypes.length)];

    // Base salary in local currency
    let baseRaw = 65000 + Math.floor(rng() * 110000);
    if (dept === 'Engineering' || dept === 'Product') baseRaw += 25000;
    if (dept === 'Legal' || dept === 'Finance') baseRaw += 15000;
    if (employment_type === 'Part-time') baseRaw = Math.round(baseRaw * 0.55);

    let localBaseSalary = baseRaw;
    const locCurr: string = loc.currency;
    if (locCurr === 'NGN') {
      localBaseSalary = Math.round((baseRaw * 1000) / 7.5);
    } else if (locCurr === 'JPY') {
      localBaseSalary = Math.round(baseRaw * 140);
    } else if (locCurr === 'GBP') {
      localBaseSalary = Math.round(baseRaw * 0.78);
    } else if (locCurr === 'EUR') {
      localBaseSalary = Math.round(baseRaw * 0.92);
    } else if (locCurr === 'CAD' || locCurr === 'AUD') {
      localBaseSalary = Math.round(baseRaw * 1.35);
    }

    const bonus = rng() > 0.3 ? Math.round((localBaseSalary * (0.05 + rng() * 0.2)) / 500) * 500 : 0;
    const salaryUSD = Math.round((localBaseSalary + bonus) * getExchangeRate(loc.currency, 'USD'));

    const startYear = 2017 + Math.floor(rng() * 7);
    const startMonth = String(1 + Math.floor(rng() * 12)).padStart(2, '0');
    const startDay = String(1 + Math.floor(rng() * 28)).padStart(2, '0');

    employees.push({
      id: `EMP-${String(10100 + i).padStart(5, '0')}`,
      name,
      email,
      job_title,
      department: dept,
      country: loc.country,
      city: loc.city,
      currency: loc.currency,
      base_salary: localBaseSalary,
      bonus,
      salary_usd: salaryUSD,
      employment_type,
      status,
      start_date: `${startYear}-${startMonth}-${startDay}`,
      created_at: new Date(Date.now() - (totalCount - i) * 3600000).toISOString(),
      updated_at: new Date(Date.now() - (totalCount - i) * 600000).toISOString(),
    });
  }

  mockEmployeesCache = employees;
  return employees;
}

/**
 * Filter & paginate mock employees matching backend query contract
 */
export function queryMockEmployees(params: EmployeeFilterParams = {}): PaginatedResponse<Employee> {
  const allEmployees = getDeterministicMockEmployees();
  let filtered = [...allEmployees];

  // 1. Text Search across name, email, job_title, department
  if (params.search && params.search.trim() !== '') {
    const q = params.search.trim().toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        e.job_title.toLowerCase().includes(q) ||
        e.department.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }

  // 2. Department filter
  if (params.department && params.department.length > 0) {
    const depts = Array.isArray(params.department) ? params.department : [params.department];
    filtered = filtered.filter((e) => depts.includes(e.department));
  }

  // 3. Country filter
  if (params.country && params.country.length > 0) {
    const countries = Array.isArray(params.country) ? params.country : [params.country];
    filtered = filtered.filter((e) => countries.includes(e.country));
  }

  // 4. Employment Type filter
  if (params.employment_type && params.employment_type.length > 0) {
    const types = Array.isArray(params.employment_type) ? params.employment_type : [params.employment_type];
    filtered = filtered.filter((e) => types.includes(e.employment_type));
  }

  // 5. Status filter
  if (params.status && params.status.length > 0) {
    const statuses = Array.isArray(params.status) ? params.status : [params.status];
    filtered = filtered.filter((e) => statuses.includes(e.status));
  }

  // 6. Sorting
  if (params.sort_by) {
    const sortField = params.sort_by as keyof Employee;
    const sortOrder = params.sort_order === 'desc' ? -1 : 1;

    filtered.sort((a, b) => {
      const valA = a[sortField];
      const valB = b[sortField];
      if (valA === undefined || valB === undefined) return 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * sortOrder;
      }
      return String(valA).localeCompare(String(valB)) * sortOrder;
    });
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.max(1, Math.min(100, params.limit || 25));
  const total = filtered.length;
  const total_pages = Math.ceil(total / limit) || 1;
  const startIndex = (page - 1) * limit;
  const items = filtered.slice(startIndex, startIndex + limit);

  return {
    items,
    total,
    page,
    limit,
    total_pages,
  };
}

/**
 * Calculate summary KPI metrics converted to target base currency
 */
export function getMockAnalyticsSummary(targetCurrency: Currency = 'USD'): AnalyticsSummary {
  const employees = getDeterministicMockEmployees();
  const activeEmployees = employees.filter((e) => e.status === 'Active');

  let totalPayrollInTarget = 0;
  const targetSalaries: number[] = [];
  const currencyCountMap: Record<string, { count: number; total: number }> = {};
  const statusCountMap: Record<string, number> = { Active: 0, 'On Leave': 0, Terminated: 0 };

  employees.forEach((emp) => {
    statusCountMap[emp.status] = (statusCountMap[emp.status] || 0) + 1;
    const totalComp = emp.base_salary + emp.bonus;
    const convertedComp = convertCurrency(totalComp, emp.currency, targetCurrency);

    if (emp.status === 'Active') {
      totalPayrollInTarget += convertedComp;
      targetSalaries.push(convertedComp);
    }

    if (!currencyCountMap[emp.currency]) {
      currencyCountMap[emp.currency] = { count: 0, total: 0 };
    }
    currencyCountMap[emp.currency].count += 1;
    currencyCountMap[emp.currency].total += totalComp;
  });

  targetSalaries.sort((a, b) => a - b);
  const activeCount = activeEmployees.length || 1;
  const average_salary = Math.round(totalPayrollInTarget / activeCount);

  let median_salary = 0;
  const mid = Math.floor(targetSalaries.length / 2);
  if (targetSalaries.length > 0) {
    median_salary =
      targetSalaries.length % 2 !== 0
        ? targetSalaries[mid]
        : Math.round((targetSalaries[mid - 1] + targetSalaries[mid]) / 2);
  }

  const currency_breakdown = Object.entries(currencyCountMap).map(([curr, val]) => ({
    currency: curr,
    count: val.count,
    total: val.total,
  }));

  const status_breakdown = Object.entries(statusCountMap).map(([status, count]) => ({
    status: status as EmployeeStatus,
    count,
  }));

  return {
    total_payroll: totalPayrollInTarget,
    average_salary,
    median_salary,
    active_headcount: activeEmployees.length,
    currency: targetCurrency,
    currency_breakdown,
    status_breakdown,
    mom_payroll_trend_pct: 3.4,
  };
}

/**
 * Calculate department compensation breakdown
 */
export function getMockDepartmentAnalytics(targetCurrency: Currency = 'USD'): DepartmentAnalytics[] {
  const employees = getDeterministicMockEmployees().filter((e) => e.status === 'Active');
  const deptMap: Record<string, { total_payroll: number; headcount: number }> = {};

  employees.forEach((emp) => {
    const comp = convertCurrency(emp.base_salary + emp.bonus, emp.currency, targetCurrency);
    if (!deptMap[emp.department]) {
      deptMap[emp.department] = { total_payroll: 0, headcount: 0 };
    }
    deptMap[emp.department].total_payroll += comp;
    deptMap[emp.department].headcount += 1;
  });

  return Object.entries(deptMap)
    .map(([department, val]) => ({
      department,
      total_payroll: val.total_payroll,
      avg_salary: Math.round(val.total_payroll / (val.headcount || 1)),
      headcount: val.headcount,
      currency: targetCurrency,
    }))
    .sort((a, b) => b.total_payroll - a.total_payroll);
}

/**
 * Calculate country compensation breakdown
 */
export function getMockCountryAnalytics(targetCurrency: Currency = 'USD'): CountryAnalytics[] {
  const employees = getDeterministicMockEmployees().filter((e) => e.status === 'Active');
  const countryMap: Record<string, { total_payroll: number; headcount: number }> = {};

  employees.forEach((emp) => {
    const comp = convertCurrency(emp.base_salary + emp.bonus, emp.currency, targetCurrency);
    if (!countryMap[emp.country]) {
      countryMap[emp.country] = { total_payroll: 0, headcount: 0 };
    }
    countryMap[emp.country].total_payroll += comp;
    countryMap[emp.country].headcount += 1;
  });

  return Object.entries(countryMap)
    .map(([country, val]) => ({
      country,
      total_payroll: val.total_payroll,
      avg_salary: Math.round(val.total_payroll / (val.headcount || 1)),
      headcount: val.headcount,
      currency: targetCurrency,
    }))
    .sort((a, b) => b.total_payroll - a.total_payroll);
}

/**
 * Fetch salary adjustment audit trail
 */
export function getMockSalaryHistory(employeeId: string): SalaryHistoryItem[] {
  if (mockSalaryHistoryCache.has(employeeId)) {
    return mockSalaryHistoryCache.get(employeeId)!;
  }

  const allEmployees = getDeterministicMockEmployees();
  const emp = allEmployees.find((e) => e.id === employeeId);
  const history: SalaryHistoryItem[] = [];

  if (emp) {
    const currentSalary = emp.base_salary;
    const prevSalary1 = Math.round(currentSalary * 0.9);
    const prevSalary2 = Math.round(prevSalary1 * 0.92);

    history.push({
      id: `HIST-${employeeId}-1`,
      employee_id: employeeId,
      previous_salary: prevSalary1,
      new_salary: currentSalary,
      change_date: '2024-01-15',
      reason: 'Annual Performance Review & Market Adjustment',
      changed_by: 'HR Admin (System)',
      diff_amount: currentSalary - prevSalary1,
      diff_percentage: Number((((currentSalary - prevSalary1) / prevSalary1) * 100).toFixed(1)),
      currency: emp.currency,
    });

    history.push({
      id: `HIST-${employeeId}-2`,
      employee_id: employeeId,
      previous_salary: prevSalary2,
      new_salary: prevSalary1,
      change_date: '2023-03-01',
      reason: 'Role Promotion & Seniority Band Upgrade',
      changed_by: 'HR Admin (System)',
      diff_amount: prevSalary1 - prevSalary2,
      diff_percentage: Number((((prevSalary1 - prevSalary2) / prevSalary2) * 100).toFixed(1)),
      currency: emp.currency,
    });
  }

  mockSalaryHistoryCache.set(employeeId, history);
  return history;
}

/**
 * Record a new salary adjustment to audit history
 */
export function recordSalaryAdjustment(
  employeeId: string,
  previousSalary: number,
  newSalary: number,
  currency: string,
  reason = 'Compensation Adjustment'
): void {
  const history = getMockSalaryHistory(employeeId);
  const diff = newSalary - previousSalary;
  const pct = previousSalary > 0 ? Number(((diff / previousSalary) * 100).toFixed(1)) : 0;

  const newItem: SalaryHistoryItem = {
    id: `HIST-${employeeId}-${Date.now()}`,
    employee_id: employeeId,
    previous_salary: previousSalary,
    new_salary: newSalary,
    change_date: new Date().toISOString().slice(0, 10),
    reason,
    changed_by: 'HR Manager (Active Session)',
    diff_amount: diff,
    diff_percentage: pct,
    currency,
  };

  mockSalaryHistoryCache.set(employeeId, [newItem, ...history]);
}

/**
 * Bulk import employee records into mock memory store
 */
export function bulkImportMockEmployees(
  newRecords: Omit<Employee, 'id' | 'created_at' | 'updated_at'>[]
): { successCount: number; employees: Employee[] } {
  const employees = getDeterministicMockEmployees();
  const created: Employee[] = [];

  newRecords.forEach((rec, idx) => {
    const newId = `EMP-${String(10000 + employees.length + idx + 1).padStart(5, '0')}`;
    const fullEmp: Employee = {
      ...rec,
      id: newId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    employees.unshift(fullEmp);
    created.push(fullEmp);
  });

  return {
    successCount: created.length,
    employees: created,
  };
}

