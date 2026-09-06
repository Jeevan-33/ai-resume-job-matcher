import { downloadPlanAsPdf } from '../pdf';
import { alertSuccess, btn } from '../ui';

const RESOURCE_TYPE_STYLE = {
  Documentation: 'text-sky-600',
  Course: 'text-emerald-600',
  Practice: 'text-amber-600',
  Search: 'text-slate-500',
};

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function LearningPlan({ plan }) {
  if (!plan) return null;

  const filename = `${slugify(plan.target_label)}-${plan.mode === 'gap' ? 'gap-plan' : 'plan'}.pdf`;

  if (plan.step_count === 0) {
    return (
      <div className={alertSuccess}>
        {plan.message || 'No skill gaps to plan for.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-800">{plan.step_count}</span> skill
          {plan.step_count === 1 ? '' : 's'} ·{' '}
          <span className="font-semibold text-slate-800">~{plan.total_estimated_weeks}</span> week
          {plan.total_estimated_weeks === 1 ? '' : 's'} estimated
        </p>
        <button onClick={() => downloadPlanAsPdf(plan, filename)} className={btn.secondary}>
          Download PDF
        </button>
      </div>

      <ol className="space-y-3">
        {plan.steps.map((step, index) => (
          <li key={step.skill} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="flex items-baseline justify-between gap-3">
              <h4 className="font-bold text-slate-900 text-sm">
                {index + 1}. {step.skill}
              </h4>
              <span className="text-xs text-slate-400 whitespace-nowrap">
                ~{step.estimated_weeks} week{step.estimated_weeks === 1 ? '' : 's'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">{step.summary}</p>
            <ul className="mt-2.5 space-y-1">
              {step.resources.map((resource) => (
                <li key={resource.url} className="text-xs">
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noreferrer"
                    className={`hover:underline font-medium ${RESOURCE_TYPE_STYLE[resource.type] || 'text-sky-600'}`}
                  >
                    {resource.name}
                  </a>
                  <span className="text-slate-300"> · {resource.type}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
