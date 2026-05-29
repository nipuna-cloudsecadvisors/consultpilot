import type { ControlTemplate } from './soc2'

export const HIPAA_CONTROLS: ControlTemplate[] = [
  // Administrative Safeguards §164.308
  { ref:'§164.308(a)(1)', category:'Administrative Safeguards', title:'Security Management Process', description:'Implement policies and procedures to prevent, detect, contain, and correct security violations.' },
  { ref:'§164.308(a)(2)', category:'Administrative Safeguards', title:'Assigned Security Responsibility', description:'Identify the security official responsible for policies and procedures.' },
  { ref:'§164.308(a)(3)', category:'Administrative Safeguards', title:'Workforce Security', description:'Implement policies to ensure appropriate access by workforce members and to prevent unauthorized access.' },
  { ref:'§164.308(a)(4)', category:'Administrative Safeguards', title:'Information Access Management', description:'Implement policies for authorizing access to ePHI consistent with applicable privacy policies.' },
  { ref:'§164.308(a)(5)', category:'Administrative Safeguards', title:'Security Awareness & Training', description:'Implement a security awareness and training program for all members of the workforce.' },
  { ref:'§164.308(a)(6)', category:'Administrative Safeguards', title:'Security Incident Procedures', description:'Implement policies to address security incidents, including reporting and response.' },
  { ref:'§164.308(a)(7)', category:'Administrative Safeguards', title:'Contingency Plan', description:'Establish policies for responding to an emergency that damages systems containing ePHI.' },
  { ref:'§164.308(a)(8)', category:'Administrative Safeguards', title:'Evaluation', description:'Perform a periodic technical and non-technical evaluation of the security policies and procedures.' },
  { ref:'§164.308(b)(1)', category:'Administrative Safeguards', title:'Business Associate Contracts', description:'Obtain satisfactory assurances from business associates that they will appropriately safeguard ePHI.' },
  // Physical Safeguards §164.310
  { ref:'§164.310(a)(1)', category:'Physical Safeguards', title:'Facility Access Controls', description:'Implement policies to limit physical access to electronic information systems while ensuring authorized access.' },
  { ref:'§164.310(b)',    category:'Physical Safeguards', title:'Workstation Use',      description:'Implement policies specifying the proper functions performed on workstations that access ePHI.' },
  { ref:'§164.310(c)',    category:'Physical Safeguards', title:'Workstation Security', description:'Implement physical safeguards for workstations that access ePHI to restrict access.' },
  { ref:'§164.310(d)(1)', category:'Physical Safeguards', title:'Device & Media Controls', description:'Implement policies for final disposal and re-use of electronic media that contain ePHI.' },
  // Technical Safeguards §164.312
  { ref:'§164.312(a)(1)', category:'Technical Safeguards', title:'Access Control', description:'Implement technical policies to allow only authorized persons or software programs to access ePHI.' },
  { ref:'§164.312(b)',    category:'Technical Safeguards', title:'Audit Controls',  description:'Implement hardware, software, and procedural mechanisms to record and examine activity in information systems that contain ePHI.' },
  { ref:'§164.312(c)(1)', category:'Technical Safeguards', title:'Integrity Controls', description:'Implement policies to protect ePHI from improper alteration or destruction.' },
  { ref:'§164.312(d)',    category:'Technical Safeguards', title:'Person Authentication', description:'Implement procedures to verify that a person seeking access to ePHI is the one claimed.' },
  { ref:'§164.312(e)(1)', category:'Technical Safeguards', title:'Transmission Security', description:'Implement technical security measures to guard against unauthorized access to ePHI transmitted over an electronic network.' },
  // Organizational §164.314
  { ref:'§164.314(a)(1)', category:'Organizational Requirements', title:'Business Associate Contracts', description:'A covered entity may permit a business associate to create, receive, maintain, or transmit ePHI only if the covered entity obtains satisfactory assurances.' },
  // Policies §164.316
  { ref:'§164.316(a)',    category:'Policies & Documentation', title:'Policies & Procedures', description:'Implement reasonable and appropriate policies and procedures to comply with the standards and implementation specifications.' },
  { ref:'§164.316(b)(1)', category:'Policies & Documentation', title:'Documentation',         description:'Maintain the policies and procedures implemented to comply with this subpart in written (which may be electronic) form.' },
]
