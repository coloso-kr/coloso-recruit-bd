import { writeFile } from 'node:fs/promises';

const API = 'https://api.ninehire.com/identity-access/homepage/recruitments?companyId=70683bd0-612b-11ec-bd23-6b2cabce5a2f&page=1&countPerPage=100&externalTitle=&affiliationId=8d781540-219e-11ed-be5d-335331d74b78&order=created_at_desc';
const response = await fetch(API, { headers: { Accept: 'application/json' } });
if (!response.ok) throw new Error(`Ninehire API ${response.status}`);

const payload = await response.json();
const source = payload.results || payload.data || payload.recruitments || [];
const text = value => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value.title || value.name || value.label || '';
};

const jobs = source
  .filter(job => !job.isPrivate && job.status === 'in_progress' && job.addressKey)
  .map(job => ({
    id: String(job.recruitmentId || job.id || ''),
    title: job.externalTitle || job.title || '',
    group: text(job.jobGroup),
    task: text(job.jobTask),
    employment: Array.isArray(job.employmentType) ? job.employmentType.join(',') : text(job.employmentType),
    career: text(job.career),
    url: `https://day1company.ninehire.site/job_posting/${job.addressKey}`,
    createdAt: job.createdAt || ''
  }));

await writeFile('jobs.json', JSON.stringify({ updatedAt: new Date().toISOString(), jobs }, null, 2) + '\n', 'utf8');
console.log(`Saved ${jobs.length} Coloso jobs`);

