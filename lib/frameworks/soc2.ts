export interface ControlTemplate {
  ref: string
  title: string
  description: string
  category: string
}

export const SOC2_CONTROLS: ControlTemplate[] = [
  // CC1 — Control Environment
  { ref:'CC1.1', category:'Control Environment', title:'COSO Principle 1 — Integrity & Ethical Values', description:'The entity demonstrates a commitment to integrity and ethical values.' },
  { ref:'CC1.2', category:'Control Environment', title:'COSO Principle 2 — Board Independence', description:'The board of directors demonstrates independence from management and exercises oversight of the development and performance of internal controls.' },
  { ref:'CC1.3', category:'Control Environment', title:'COSO Principle 3 — Structures, Authorities, Responsibilities', description:'Management establishes, with board oversight, structures, reporting lines, and appropriate authorities and responsibilities in the pursuit of objectives.' },
  { ref:'CC1.4', category:'Control Environment', title:'COSO Principle 4 — Commitment to Competence', description:'The entity demonstrates a commitment to attract, develop, and retain competent individuals in alignment with objectives.' },
  { ref:'CC1.5', category:'Control Environment', title:'COSO Principle 5 — Accountability', description:'The entity holds individuals accountable for their internal control responsibilities in the pursuit of objectives.' },
  // CC2 — Communication & Information
  { ref:'CC2.1', category:'Communication & Information', title:'COSO Principle 13 — Relevant Information', description:'The entity obtains or generates and uses relevant, quality information to support the functioning of internal control.' },
  { ref:'CC2.2', category:'Communication & Information', title:'COSO Principle 14 — Internal Communication', description:'The entity internally communicates information, including objectives and responsibilities for internal control.' },
  { ref:'CC2.3', category:'Communication & Information', title:'COSO Principle 15 — External Communication', description:'The entity communicates with external parties regarding matters affecting the functioning of internal control.' },
  // CC3 — Risk Assessment
  { ref:'CC3.1', category:'Risk Assessment', title:'COSO Principle 6 — Objectives', description:'The entity specifies objectives with sufficient clarity to enable the identification and assessment of risks relating to objectives.' },
  { ref:'CC3.2', category:'Risk Assessment', title:'COSO Principle 7 — Risk Identification & Analysis', description:'The entity identifies risks to the achievement of its objectives across the entity and analyzes risks as a basis for determining how risks should be managed.' },
  { ref:'CC3.3', category:'Risk Assessment', title:'COSO Principle 8 — Fraud Risk', description:'The entity considers the potential for fraud in assessing risks to the achievement of objectives.' },
  { ref:'CC3.4', category:'Risk Assessment', title:'COSO Principle 9 — Changes', description:'The entity identifies and assesses changes that could significantly impact the system of internal control.' },
  // CC4 — Monitoring
  { ref:'CC4.1', category:'Monitoring', title:'COSO Principle 16 — Ongoing Evaluations', description:'The entity selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.' },
  { ref:'CC4.2', category:'Monitoring', title:'COSO Principle 17 — Deficiency Remediation', description:'The entity evaluates and communicates internal control deficiencies in a timely manner to parties responsible for taking corrective action.' },
  // CC5 — Control Activities
  { ref:'CC5.1', category:'Control Activities', title:'COSO Principle 10 — Selection of Control Activities', description:'The entity selects and develops control activities that contribute to the mitigation of risks to the achievement of objectives to acceptable levels.' },
  { ref:'CC5.2', category:'Control Activities', title:'COSO Principle 11 — Technology Controls', description:'The entity also selects and develops general control activities over technology to support the achievement of objectives.' },
  { ref:'CC5.3', category:'Control Activities', title:'COSO Principle 12 — Policies & Procedures', description:'The entity deploys control activities through policies that establish what is expected and procedures that put policies into action.' },
  // CC6 — Logical & Physical Access
  { ref:'CC6.1', category:'Logical & Physical Access', title:'Logical Access Security Software', description:'The entity implements logical access security software, infrastructure, and architectures over protected information assets to protect them from security events.' },
  { ref:'CC6.2', category:'Logical & Physical Access', title:'New Internal Access Requests', description:'Prior to issuing system credentials and granting system access, the entity registers and authorizes new internal and external users.' },
  { ref:'CC6.3', category:'Logical & Physical Access', title:'Access Removal', description:'The entity authorizes, modifies, or removes access to data, software, functions, and other protected information assets based on roles, responsibilities, or the system design.' },
  { ref:'CC6.4', category:'Logical & Physical Access', title:'Physical Access Restrictions', description:'The entity restricts physical access to facilities and protected information assets to authorized personnel.' },
  { ref:'CC6.5', category:'Logical & Physical Access', title:'Disposal / Retirement of Assets', description:'The entity discontinues logical and physical protections over physical assets only after the ability to read or recover data and software from those assets has been diminished.' },
  { ref:'CC6.6', category:'Logical & Physical Access', title:'External Threats', description:'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.' },
  { ref:'CC6.7', category:'Logical & Physical Access', title:'Information Transmission', description:'The entity restricts the transmission, movement, and removal of information to authorized internal and external users and processes.' },
  { ref:'CC6.8', category:'Logical & Physical Access', title:'Malicious Software', description:'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.' },
  // CC7 — System Operations
  { ref:'CC7.1', category:'System Operations', title:'Detection / Monitoring', description:'To meet its objectives, the entity uses detection and monitoring procedures to identify changes to configurations or the introduction of new vulnerabilities.' },
  { ref:'CC7.2', category:'System Operations', title:'Monitoring for Anomalies', description:'The entity monitors system components and the operation of those components for anomalies that are indicative of malicious acts, natural disasters, and errors.' },
  { ref:'CC7.3', category:'System Operations', title:'Incident Evaluation', description:'The entity evaluates security events to determine whether they could or have resulted in a failure of the entity to meet its objectives.' },
  { ref:'CC7.4', category:'System Operations', title:'Incident Response', description:'The entity responds to identified security incidents by executing a defined incident response program.' },
  { ref:'CC7.5', category:'System Operations', title:'Incident Recovery', description:'The entity identifies, develops, and implements activities to recover from identified security incidents.' },
  // CC8 — Change Management
  { ref:'CC8.1', category:'Change Management', title:'Change Management Process', description:'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes to infrastructure, data, software, and procedures.' },
  // CC9 — Risk Mitigation
  { ref:'CC9.1', category:'Risk Mitigation', title:'Risk Mitigation', description:'The entity identifies, selects, and develops risk mitigation activities for risks arising from potential business disruptions.' },
  { ref:'CC9.2', category:'Risk Mitigation', title:'Vendor / Business Partner Risk', description:'The entity assesses and manages risks associated with vendors and business partners.' },
]
