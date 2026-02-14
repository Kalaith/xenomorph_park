import { CrisisEvent } from '../../types';

export const extendedCrisisEvents: CrisisEvent[] = [
  {
    name: 'Containment Breach',
    probability: 0.3,
    severity: 'Medium',
    description: 'Single xenomorph escapes containment. Security protocols activated.',
    responseOptions: [
      'Security lockdown - Seal all exits (-20 visitors, +10 security)',
      'Colonial Marine deployment - Send armed response (+resources cost, guaranteed success)',
      'Facility evacuation - Evacuate all civilians (-50% visitors, -facility income)',
    ],
  },
  {
    name: 'Power Failure',
    probability: 0.2,
    severity: 'High',
    description: 'Main power grid failure detected. All containment systems at risk of shutdown.',
    responseOptions: [
      'Emergency power - Use backup generators (-50% power for 2 days)',
      'Immediate evacuation - Clear facility entirely (-80% visitors, -security risk)',
      'Manual lockdown - Manually secure all containment (-power, requires staff)',
    ],
  },
  {
    name: 'Hive Outbreak',
    probability: 0.1,
    severity: 'Critical',
    description: 'Multiple xenomorphs coordinate escape attempt. Threat level: MAXIMUM',
    responseOptions: [
      'Nuclear option - Sterilize contaminated areas (-facilities, guaranteed elimination)',
      'Full marine assault - Deploy entire security force (-credits, -staff safety)',
      'Abandon facility - Evacuate all personnel and seal facility (-game over scenario)',
    ],
  },
  {
    name: 'Visitor Incident',
    probability: 0.25,
    severity: 'Low',
    description: 'Tourist safety incident reported. Media attention increasing.',
    responseOptions: [
      'Cover-up - Use corporate influence to suppress news (-credits, +reputation)',
      'Public relations - Hold press conference and show transparency (+trust, -secrets)',
      'Compensation - Pay damages to affected parties (-credits, +visitor confidence)',
    ],
  },
  {
    name: 'Research Contamination',
    probability: 0.15,
    severity: 'Medium',
    description: 'Laboratory contamination detected. Research materials compromised.',
    responseOptions: [
      'Quarantine lab - Seal and decontaminate research area (-research progress)',
      'Continue research - Risk spreading contamination for scientific gain (+research, +risk)',
      'Destroy samples - Eliminate contamination but lose research data (-research points)',
    ],
  },
  {
    name: 'Staff Rebellion',
    probability: 0.1,
    severity: 'High',
    description: 'Facility staff protest dangerous working conditions. Morale critical.',
    responseOptions: [
      'Increase security - Use force to maintain order (-staff morale, +control)',
      'Negotiate demands - Meet staff safety requirements (+credits cost, +morale)',
      'Replace staff - Hire new personnel with fewer scruples (-time, -expertise)',
    ],
  },
  {
    name: 'Corporate Inspection',
    probability: 0.2,
    severity: 'Medium',
    description: 'Weyland-Yutani corporate inspection team arrives unannounced.',
    responseOptions: [
      'Full cooperation - Show all facilities and records (+corporate standing)',
      'Limited access - Restrict access to sensitive areas (+secrecy, -trust)',
      'Bribe officials - Use credits to ensure favorable report (-credits, +results)',
    ],
  },
];
