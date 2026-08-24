

# New Zealand NCSC Minimum Cyber Security Standards: CrowdStrike Falcon Solution Mapping

## Executive Summary

New Zealand's National Cyber Security Centre published ten Minimum Cyber Security Standards in October 2025, mandatory for government agencies under the Government Chief Information Security Officer mandate. These standards address foundational cybersecurity practices across five core functions: Guide & Govern, Identify & Understand, Prevent & Protect, Detect & Contain, and Respond & Recover.

This report analyzes how CrowdStrike Falcon's unified platform addresses each standard, demonstrating comprehensive coverage through its single-agent architecture and cloud-native approach.

---

## Understanding the Framework

The standards align with the NCSC Cyber Security Framework and require organizations to achieve CMM2 (Planned & Tracked) maturity level as a minimum baseline. They apply to all business-critical and externally facing systems, addressing the most common attack vectors observed in actual incidents.

The ten standards cover: security awareness, risk management, asset identification and prioritization, secure software configuration, patching, multi-factor authentication, detection of unusual behavior, least privilege principles, data recovery, and response planning.

---

## Standard 1: Security Awareness and Culture

**Standard Overview:** Organizations must ensure staff possess the necessary context, understanding, and awareness to carry out their responsibilities securely. This includes structured awareness programs, training, and communication channels for reporting security incidents.

**CrowdStrike Falcon Solution:**

CrowdStrike addresses this through visibility and education rather than direct training delivery. Falcon's unified dashboard provides security teams with real-time context about threats and incidents, which can inform training programs. The platform's intuitive interface and comprehensive reporting enable security teams to create data-driven awareness campaigns based on actual threats targeting the organization.

Falcon Insight XDR provides detailed attack narratives and threat intelligence that security teams can translate into employee education materials. The platform identifies behavioral patterns that indicate potential insider threats or compromised accounts, helping organizations understand where training gaps exist. Additionally, CrowdStrike's threat intelligence feeds provide real-world attack scenarios that can be incorporated into security awareness programs.

---

## Standard 2: Risk Management and Governance

**Standard Overview:** Organizations must implement appropriate cyber security governance processes with clear lines of responsibility and accountability to named individuals for protecting sensitive information and key operational services.

**CrowdStrike Falcon Solution:**

Falcon's governance capabilities begin with comprehensive visibility across the entire attack surface. The platform provides executive dashboards and risk scoring that enables security leaders to communicate cyber risk in business terms to stakeholders and board members.

Falcon Exposure Management delivers adversary-driven risk management with real-time asset visibility and prioritization. The platform maps attack paths and vulnerabilities against actual adversary tactics, helping organizations understand which risks matter most. This capability allows security leaders to establish clear accountability by identifying which systems, users, and configurations present the highest risk.

The Falcon platform supports role-based access control, enabling organizations to define clear responsibilities within the security team. Policy management features allow organizations to create, document, and enforce security policies centrally, with audit trails showing who made changes and when.

---

## Standard 3: Asset Identification and Prioritization

**Standard Overview:** Organizations must identify and catalog sensitive information and critical assets, understanding what needs protection and why.

**CrowdStrike Falcon Solution:**

Falcon Discover provides comprehensive asset inventory and visibility without requiring additional hardware or agents. The solution automatically identifies managed and unmanaged assets across the environment in real-time, providing complete visibility into endpoints, servers, cloud workloads, and IoT/OT devices.

The platform captures detailed asset metadata including hardware specifications, installed applications, operating systems, encryption status, and network connections. Falcon's Asset Graph visualizes relationships between assets, revealing dependencies and potential attack paths. This contextual understanding helps organizations prioritize which assets are most critical to business operations.

Falcon Discover monitors asset inventory continuously, automatically updating when new devices connect to the network or when configurations change. The solution tracks application usage, identifying unauthorized or outdated software that may pose security risks. For compliance purposes, the platform maintains historical asset data for up to 90 days, enabling organizations to demonstrate proper asset management over time.

The recent XIoT Discovery innovation extends this capability to industrial control systems and operational technology environments, providing zero-touch discovery across segmented networks without intrusive scanning or dedicated sensors.

---

## Standard 4: Secure Configuration

**Standard Overview:** Systems must be configured securely to reduce the attack surface and prevent exploitation of common vulnerabilities through misconfigurations.

**CrowdStrike Falcon Solution:**

Falcon addresses secure configuration through multiple complementary capabilities. The platform provides configuration assessment and drift detection, identifying systems that deviate from established security baselines. This enables organizations to maintain consistent security configurations across their environment.

Falcon Device Control delivers granular control over USB devices and removable media, a critical configuration requirement for preventing data exfiltration and malware introduction. The solution allows organizations to define policies controlling which devices can connect, what actions they can perform, and under what circumstances.

Falcon Firewall Management provides visibility and control over host-based firewalls, ensuring network protection policies are consistently applied. This eliminates the complexity of managing disparate firewall configurations across different operating systems.

For cloud environments, Falcon integrates with cloud-native security controls to assess configuration posture and identify misconfigurations that could expose workloads to attack. The platform's security posture management capabilities continuously monitor for configuration drift and policy violations.

The System Insights dashboard in Falcon Discover provides visibility into security settings across all endpoints, including drive encryption status, Windows Defender configurations, and other OS-level security controls. This centralized view enables security teams to quickly identify configuration weaknesses and remediate them at scale.

---

## Standard 5: Patch Management

**Standard Overview:** Organizations must maintain current patches for operating systems and applications to address known vulnerabilities before they can be exploited.

**CrowdStrike Falcon Solution:**

While CrowdStrike doesn't directly deploy patches, Falcon Spotlight provides comprehensive vulnerability management that enables effective patch prioritization and validation. The solution continuously assesses endpoints for vulnerabilities without requiring scanning windows or network disruption.

Falcon Spotlight leverages ExPRT.AI (Exploit Rating and Triage AI) to analyze vulnerabilities in context, considering whether exploit code exists, if the vulnerability is being actively exploited in the wild, and whether it's present on internet-facing or business-critical systems. This intelligence-driven approach helps organizations prioritize patching efforts on vulnerabilities that pose actual risk rather than chasing every CVE.

The platform provides detailed visibility into patch levels across all endpoints and applications, showing which systems require updates and tracking patch deployment progress over time. This visibility enables organizations to demonstrate compliance with patching requirements and identify systems that consistently fall behind patch schedules.

Falcon integrates with existing patch management solutions, providing the intelligence layer that informs patching decisions. When zero-day vulnerabilities emerge, Falcon's behavioral detection capabilities provide protection even before patches are available, buying organizations time to test and deploy updates without creating operational risk.

The Application Inventory feature in Falcon Discover identifies outdated application versions across the environment, helping organizations understand their vulnerability exposure beyond operating system patches.

---

## Standard 6: Multi-Factor Authentication

**Standard Overview:** Organizations must implement multi-factor authentication for privileged accounts and remote access to prevent credential-based attacks.

**CrowdStrike Falcon Solution:**

Falcon Identity Protection delivers comprehensive MFA capabilities integrated directly into the security platform. The solution enforces MFA for remote desktop protocol access, addressing a common attack vector that traditional security tools struggle to protect.

Falcon Identity Protection's risk-based conditional access evaluates multiple factors before granting access, including user risk scores, device trust status, authentication patterns, and behavioral baselines. When suspicious activity is detected, the platform can automatically inject MFA challenges even if they weren't originally required, adapting security controls to match the threat level.

The recently announced FalconID takes this further by providing phishing-resistant, passwordless MFA based on FIDO2 standards. This eliminates common MFA bypass techniques including phishing, MFA fatigue attacks, and session hijacking. Unlike standalone MFA solutions that make binary authentication decisions, FalconID leverages real-time security telemetry from across the Falcon platform to make contextual access decisions.

Falcon Identity Protection operates inline with authentication flows for both on-premises Active Directory and cloud identity providers like Microsoft Entra ID and Okta. This hybrid coverage ensures consistent MFA enforcement regardless of where identities are managed. Organizations can extend MFA to legacy applications and systems that don't natively support modern authentication methods.

The platform's policy engine allows organizations to define granular MFA requirements based on user role, device type, location, time of day, and risk level. This flexibility enables organizations to balance security with user experience, applying stronger authentication when risk is elevated while minimizing friction for low-risk scenarios.

---

## Standard 7: Behavioral Detection and Monitoring

**Standard Overview:** Organizations must detect unusual behavior and common cyber attacks through continuous monitoring and analysis of security events.

**CrowdStrike Falcon Solution:**

Behavioral detection is the foundation of CrowdStrike's approach to endpoint security. Falcon pioneered Indicators of Attack methodology, focusing on adversary behaviors and tactics rather than relying solely on signature-based detection. This enables the platform to detect novel attacks, including malware-free intrusions that bypass traditional defenses.

Falcon Insight EDR continuously monitors endpoint activities, capturing over 400 event types to create a comprehensive record of system behaviors. The platform analyzes these events using machine learning and behavioral analytics, comparing observed activity against known attack patterns and normal behavioral baselines. When suspicious sequences are detected, Falcon generates high-fidelity alerts with rich context about what happened, why it's suspicious, and what the potential impact could be.

The platform's User and Entity Behavior Analytics capabilities identify anomalous authentication patterns, unusual file access, abnormal network connections, and other indicators of compromise. This behavioral approach detects insider threats and compromised credentials even when attackers use legitimate tools and processes.

Falcon Identity Protection extends behavioral detection to the identity layer, monitoring authentication events across hybrid environments. The solution establishes behavioral baselines for each user, detecting anomalies like impossible travel, unusual access patterns, or privilege escalation attempts. When identity-based attacks occur, the platform correlates identity events with endpoint telemetry to reveal the full attack chain.

Charlotte AI, CrowdStrike's agentic AI system, automates detection triage and analysis, dramatically reducing the time required to investigate suspicious activity. The AI analyzes alerts in context, correlates related events, and provides analyst-ready summaries that accelerate response.

All detection data flows through the CrowdStrike Security Cloud, where threat intelligence is continuously applied to identify tactics, techniques, and procedures associated with known adversary groups. This intelligence enrichment helps organizations understand not just what happened, but who might be behind an attack and what their objectives might be.

---

## Standard 8: Least Privilege Access

**Standard Overview:** Organizations must apply the principle of least privilege, ensuring users and systems have only the minimum access necessary to perform their functions.

**CrowdStrike Falcon Solution:**

Falcon Privileged Access enforces just-in-time access for privileged administrator roles, dramatically reducing the standing privileges that create persistent attack opportunities. Unlike traditional Privileged Access Management solutions that require months to implement, Falcon Privileged Access leverages the existing Falcon sensor and cloud connectors to deliver rapid deployment and value.

The solution provides granular visibility into privileged account usage, identifying which accounts have elevated permissions, when they're used, and whether that usage aligns with expected patterns. This visibility enables organizations to identify over-privileged accounts and scope permissions appropriately.

Falcon Identity Protection identifies accounts with "stealthy privileges" including shadow admins, stale privileged accounts, and service accounts with excessive permissions. The platform's domain security overview highlights risky configurations and recommends specific remediation actions to reduce privilege-related attack surface.

The policy engine enables organizations to create custom access controls for privileged accounts, including rules that block high-risk accounts, restrict access to specific devices, or require additional verification steps for sensitive operations. These policies can be enforced automatically in real-time without requiring manual intervention.

For programmatic accounts and service accounts, Falcon Identity Protection can detect and block unexpected usage patterns, preventing attackers from abusing these often over-privileged credentials. The platform identifies when service accounts are used for interactive logons or other activities outside their normal scope.

Device control capabilities ensure that privileged users cannot bypass security controls through removable media or unauthorized devices, maintaining the principle of least privilege even when users have elevated system permissions.

---

## Standard 9: Backup and Recovery

**Standard Overview:** Organizations must maintain secure backups and test recovery procedures to ensure business continuity after incidents including ransomware attacks.

**CrowdStrike Falcon Solution:**

While CrowdStrike doesn't provide backup services directly, Falcon's capabilities are essential for protecting backup infrastructure and ensuring recovery processes remain viable during attacks.

Falcon monitors backup systems as part of the overall endpoint protection strategy, detecting when attackers attempt to delete, encrypt, or corrupt backup data—a common ransomware tactic. The platform's behavioral detection identifies Volume Shadow Copy deletion, backup service termination, and other indicators that ransomware actors are preparing to deploy their payload.

Falcon's real-time response capabilities enable security teams to isolate compromised systems before ransomware can spread to backup infrastructure. This network containment happens automatically based on policy, preventing lateral movement that could compromise recovery capabilities.

The platform provides comprehensive forensic data that supports incident recovery efforts. After an incident, security teams can use Falcon's historical telemetry to understand exactly what systems were affected, what data was accessed, and whether backups themselves were compromised. This intelligence is critical for determining safe restoration points.

Falcon integrates with major backup and disaster recovery solutions, extending protection to these critical infrastructure components. The platform ensures that backup servers and storage systems have the same level of endpoint protection as production workloads.

For organizations with cloud backups, Falcon's cloud workload protection extends monitoring to backup storage buckets and snapshots, detecting unauthorized access or modification attempts. The platform's identity protection capabilities ensure that credentials used to access backup systems are properly monitored and protected.

---

## Standard 10: Incident Response Planning

**Standard Overview:** Organizations must have documented incident response plans with clearly defined actions, roles, and responsibilities, including regular testing and improvement processes.

**CrowdStrike Falcon Solution:**

Falcon provides the technological foundation for effective incident response through rapid detection, investigation, and remediation capabilities. The platform's unified architecture ensures that responders have complete visibility across endpoints, identities, cloud workloads, and network traffic from a single console.

Falcon Insight XDR accelerates investigation by automatically correlating events across different security domains, revealing the full attack chain rather than isolated alerts. Responders can pivot from an alert to complete forensic detail in seconds, dramatically reducing mean time to understand. The platform's graph database architecture maintains relationships between entities, enabling analysts to quickly trace lateral movement and identify all affected systems.

Real-time Response capabilities enable immediate action without requiring physical access to compromised systems. Responders can isolate infected endpoints from the network, terminate malicious processes, quarantine files, collect forensic evidence, and deploy remediation scripts—all through the Falcon console. These capabilities work whether endpoints are on the corporate network, remote, or offline, as actions queue and execute when systems reconnect.

Falcon Fusion SOAR (Security Orchestration, Automation and Response) enables organizations to codify response procedures into automated workflows and playbooks. Common response actions can execute automatically based on alert type and severity, ensuring consistent and rapid initial response even outside business hours. Organizations can build and test incident response workflows within Falcon, documenting procedures in executable form.

For organizations requiring external expertise, CrowdStrike offers Falcon Complete, a managed detection and response service where CrowdStrike's security operations team operates as an extension of the customer's team. This service includes 24/7 monitoring, investigation, and response, with experts handling incidents according to pre-established runbooks and escalation procedures.

The platform supports incident response planning through comprehensive logging and forensic capabilities. Organizations can conduct tabletop exercises using historical data, testing response procedures against real-world attack patterns captured by Falcon. Post-incident analysis features help organizations learn from security events and improve their response procedures over time.

Charlotte Agentic SOAR, the orchestration layer of Falcon's agentic platform, coordinates AI-powered agents across the security lifecycle, enabling dynamic collaboration between automated and human-driven response activities. This agentic approach allows organizations to scale incident response capabilities beyond what human teams can achieve alone.

---

## Platform Advantages for Standards Compliance

**Single Agent Architecture:** CrowdStrike's unified approach eliminates the complexity of managing multiple security agents. Organizations deploy one lightweight sensor that delivers endpoint protection, EDR, XDR, identity protection, vulnerability management, asset discovery, and device control. This architectural simplicity accelerates deployment and reduces operational overhead while meeting multiple standards simultaneously.

**Cloud-Native Platform:** Falcon's cloud-native architecture ensures organizations always have access to the latest threat intelligence and detection capabilities without managing infrastructure or deploying updates. The platform processes and stores telemetry centrally, enabling correlation and analysis at scale that on-premises solutions cannot match.

**Real-Time Intelligence:** The CrowdStrike Security Cloud applies intelligence from observing adversary activity across millions of protected endpoints worldwide. This community immunity means organizations benefit from attacks stopped elsewhere, continuously improving detection capabilities based on emerging threats.

**Operational Efficiency:** Meeting the ten standards requires consistent execution across people, processes, and technology. Falcon's automation capabilities free security teams from repetitive tasks, enabling them to focus on strategic initiatives. The platform's AI-driven detection triage and response acceleration multiplies team effectiveness.

**Compliance Reporting:** Falcon provides comprehensive reporting and dashboards that support compliance demonstration. Organizations can generate evidence showing asset inventory, vulnerability status, patch levels, authentication controls, and incident response activities. This built-in compliance support reduces the administrative burden of demonstrating standards adherence.

---

## Implementation Recommendations

Organizations implementing CrowdStrike Falcon to meet the NZ NCSC Minimum Cyber Security Standards should consider a phased approach that prioritizes quick wins while building toward comprehensive coverage.

**Phase 1: Foundation (Months 1-2)** Deploy Falcon Prevent across all endpoints to establish baseline protection. Enable Falcon Discover for asset visibility and Falcon Insight for detection and response capabilities. This foundation addresses Standards 3, 4, 7, and partially addresses Standard 10.

**Phase 2: Identity and Access (Months 2-4)** Implement Falcon Identity Protection to enforce MFA and monitor authentication activities. Deploy Falcon Privileged Access to establish just-in-time access controls. This phase addresses Standards 6 and 8 while enhancing detection capabilities from Phase 1.

**Phase 3: Risk Management (Months 3-6)** Enable Falcon Spotlight for vulnerability management and integrate with existing patch management processes. Deploy Falcon Exposure Management for comprehensive attack surface visibility and risk prioritization. This addresses Standard 5 and enhances Standard 2 capabilities.

**Phase 4: Optimization (Ongoing)** Establish operational rhythms for reviewing dashboards, tuning policies, and conducting incident response exercises. Leverage Falcon Fusion SOAR to automate common response actions. Integrate security awareness programs with intelligence from Falcon detections. This ongoing phase ensures continued compliance with all standards and drives maturity improvement.

Throughout implementation, organizations should leverage CrowdStrike's professional services and managed services offerings to accelerate deployment and ensure optimal configuration. The CrowdStrike University provides training resources that help security teams maximize platform capabilities.

---

## Conclusion

CrowdStrike Falcon provides comprehensive capabilities addressing all ten of New Zealand's NCSC Minimum Cyber Security Standards through a unified, cloud-native platform. The solution's strength lies not just in feature coverage, but in how these capabilities integrate to provide defense in depth across the entire attack surface.

By consolidating endpoint protection, detection and response, identity security, vulnerability management, and asset visibility into a single platform with one agent, CrowdStrike eliminates the complexity and integration challenges that plague multi-vendor security stacks. This architectural approach accelerates deployment, improves operational efficiency, and delivers better security outcomes.

Organizations using Falcon gain more than compliance with minimum standards—they establish a foundation for continuous security maturity improvement. The platform's intelligence-driven approach and automation capabilities enable security teams to stay ahead of adversaries while demonstrating measurable progress against the NCSC's capability maturity model.

For government agencies and organizations seeking to meet the October 2025 deadline, CrowdStrike Falcon offers a proven, rapidly deployable solution backed by extensive experience protecting critical infrastructure and sensitive environments worldwide.
