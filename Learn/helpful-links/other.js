const OTHER = {
    intro: [
        { title: "Welcome to CrowdStrike Falcon", type: "Tech Center", blurb: "Official onboarding article for the Falcon console and platform.", url: "https://www.crowdstrike.com/blog/tech-center/welcome-to-crowdstrike-falcon/" },
        { title: "Introduction to Falcon Endpoint Security", type: "YouTube", blurb: "Platform walkthrough covering prevention and visibility.", url: "https://www.youtube.com/watch?v=tgryLPiVGLE" },
        { title: "Falcon console introduction", type: "YouTube", blurb: "UI tour of the Falcon console.", url: "https://www.youtube.com/watch?v=oAGUHgtf7c8" }
    ],
    deploy: [
        { title: "Install Falcon Sensor for Windows", type: "Tech Center", blurb: "Windows sensor deployment guide.", url: "https://www.crowdstrike.com/blog/tech-center/install-falcon-sensor/" },
        { title: "Install Falcon Sensor for Linux", type: "YouTube", blurb: "Linux sensor install walkthrough.", url: "https://www.youtube.com/watch?v=DNA4SKIaa98" },
        { title: "Install Falcon Sensor for Mac", type: "YouTube", blurb: "macOS sensor install walkthrough.", url: "https://www.youtube.com/watch?v=ofqdrqJ0m30" },
        { title: "How to manage policies", type: "Tech Center", blurb: "Prevention and sensor policy management.", url: "https://www.crowdstrike.com/blog/tech-center/how-to-manage-policies-in-falcon/" },
        { title: "Falcon sensor on AWS WorkSpaces", type: "Guide", blurb: "Deploy the sensor to Amazon WorkSpaces.", url: "https://www.crowdstrike.com/resources/guides/how-to-deploy-crowdstrike-falcon-sensor-on-aws/" },
        { title: "Falcon sensor across GCP workloads", type: "Guide", blurb: "Cloud workload sensor deployment on GCP.", url: "https://www.crowdstrike.com/resources/guides/how-to-deploy-falcon-sensor-across-gcp-workloads/" }
    ],
    demos: [
        { pillar: "endpoint", title: "Falcon Endpoint Protection Pro demo", type: "Resource Center", domain: "EPP / NGAV", blurb: "Public demonstration of Falcon Endpoint Protection Pro.", url: "https://www.crowdstrike.com/resources/demos/demonstration-of-falcon-endpoint-protection-pro/" },
        { pillar: "endpoint", title: "Falcon Endpoint Protection Enterprise demo", type: "Resource Center", domain: "EDR / XDR", blurb: "Enterprise-tier endpoint demonstration.", url: "https://www.crowdstrike.com/resources/demos/demonstration-of-falcon-endpoint-protection-enterprise/" },
        { pillar: "endpoint", title: "Falcon Endpoint Protection Complete demo", type: "Resource Center", domain: "Managed endpoint", blurb: "Complete-tier endpoint demonstration.", url: "https://www.crowdstrike.com/resources/demos/demonstration-of-falcon-endpoint-protection-complete/" },
        { pillar: "endpoint", title: "Use case: true endpoint visibility", type: "YouTube", domain: "EDR", blurb: "Visibility-focused Falcon use case from the official channel.", url: "https://www.youtube.com/watch?v=pHxb6EyjhPw" },

        { pillar: "identity", title: "Falcon Identity Protection: secure your cloud identity", type: "YouTube", domain: "ITDR", blurb: "Demo Drill Down: detect anomalous Entra ID logins and revoke stolen sessions.", url: "https://www.youtube.com/watch?v=3bvWflKnbiM" },
        { pillar: "identity", title: "See Falcon Identity Protection in action", type: "Resource Center", domain: "ITDR", blurb: "Visibility, detections, prevention, and response for identity-based breaches.", url: "https://www.crowdstrike.com/en-us/resources/demos/falcon-identity-protection/" },
        { pillar: "identity", title: "Falcon Identity Protection module training", type: "YouTube", domain: "Continuous Identity", blurb: "Product training: AD risk, identity attacks, and risk-based conditional access.", url: "https://www.youtube.com/watch?v=tBNC6E2al6U" },

        { pillar: "cloud", title: "Falcon Cloud Security Graph Explorer", type: "YouTube", domain: "CNAPP", blurb: "Investigate internet-exposed, unprotected, and exploitable cloud risk across AWS, Azure, and GCP.", url: "https://www.youtube.com/watch?v=rEp8VCcvRX4" },
        { pillar: "cloud", title: "See Falcon Shield in action", type: "YouTube", domain: "SSPM", blurb: "SaaS posture, identities, shadow SaaS, and AI-agent inventory from Falcon Shield.", url: "https://www.youtube.com/watch?v=ruQ844tfJTY" },

        { pillar: "data", title: "Falcon Data Protection: prevent GenAI data loss", type: "YouTube", domain: "DLP", blurb: "Stop sensitive PII from being pasted from managed OneDrive into ChatGPT.", url: "https://www.youtube.com/watch?v=YV1n4iYRmWk" },
        { pillar: "data", title: "Falcon Data Protection: PCI egress prevention", type: "YouTube", domain: "DLP", blurb: "Block credit-card data moving from managed OneDrive to personal Gmail or USB.", url: "https://www.youtube.com/watch?v=WVqhkiSaeI8" },

        { pillar: "network", title: "Stopping cross-domain attacks", type: "YouTube", domain: "Platform / ZTNA-adjacent", blurb: "Identity, endpoint, and cloud kill chain in one incident workbench. Native network coverage is Falcon Secure Access; NDR/SASE remain partner-led.", url: "https://www.youtube.com/watch?v=31ivWoyxvek" },

        { pillar: "email", title: "CrowdStrike Alliance Landscape", type: "Partner coverage", domain: "Email security", blurb: "No native Falcon email SKU and no public CrowdStrike email demo. Cover this pillar via alliance partners.", url: "../../Research/infosec-solutions-map/" },

        { pillar: "secops", title: "Falcon Next-Gen SIEM: streamline the SOC", type: "YouTube", domain: "SIEM", blurb: "Incident workbench, Charlotte summary, and an on-demand Fusion password-reset workflow.", url: "https://www.youtube.com/watch?v=KG2kb_2xhBo" },
        { pillar: "secops", title: "Detection coverage with Falcon Next-Gen SIEM", type: "YouTube", domain: "Detection content", blurb: "ATT&CK coverage dashboard, adversary filters, and deploying rule templates.", url: "https://www.youtube.com/watch?v=aOkq_UShp6A" },
        { pillar: "secops", title: "Stopping cross-domain attacks", type: "YouTube", domain: "XDR / hunting", blurb: "Correlate endpoint, identity, and cloud into one Scattered Spider-style incident, with OverWatch hunting.", url: "https://www.youtube.com/watch?v=31ivWoyxvek" },

        { pillar: "intel", title: "See Falcon Exposure Management in action", type: "YouTube", domain: "CTEM", blurb: "Internal and external exposure, attack paths, ExPRT.AI, and remediation with Falcon for IT.", url: "https://www.youtube.com/watch?v=MZOqAyUI1VY" },
        { pillar: "intel", title: "Falcon Exposure Management: AI inventory", type: "YouTube", domain: "CTEM / AI", blurb: "Discover LLMs, MCP servers, and IDE extensions on hosts, then govern unapproved AI with Fusion.", url: "https://www.youtube.com/watch?v=3Ti7tOVwAjo" },
        { pillar: "intel", title: "Falcon Exposure Management: active asset scanning", type: "Resource Center", domain: "EASM / discovery", blurb: "Non-intrusive active asset discovery for unmanaged and network-visible systems.", url: "https://www.crowdstrike.com/resources/videos/falcon-exposure-management-active-asset-scanning-demo/" },

        { pillar: "ot", title: "See Falcon for XIoT in action", type: "YouTube", domain: "OT / IoT", blurb: "Collector-based discovery, ExPRT.AI rescoring, and Purdue-model asset graphs — without extra appliances.", url: "https://www.youtube.com/watch?v=OdKihYqy9hc" },

        { pillar: "appsec", title: "See Falcon Shield in action", type: "YouTube", domain: "SaaS apps", blurb: "SaaS, identity, and AI-agent security at the application edge.", url: "https://www.youtube.com/watch?v=ruQ844tfJTY" },

        { pillar: "grc", title: "Falcon Discover IT hygiene", type: "YouTube", domain: "IT hygiene / CMDB", blurb: "Application, asset, and account inventory from the existing Falcon sensor.", url: "https://www.youtube.com/watch?v=xESb6eoC4HI" },
        { pillar: "grc", title: "Falcon for IT: ask any question", type: "Resource Center", domain: "Endpoint operations", blurb: "Real-time fleet questions and package remediation, including an XZ-Utils Linux example.", url: "https://www.crowdstrike.com/en-us/resources/demos/falcon-for-it-get-instant-answers-demo-drill-down/" },

        { pillar: "ai", title: "Falcon Guardian: secure AI agents where they execute", type: "YouTube", domain: "Guardian", blurb: "Official product demo: sensor-based agent inventory, sanctioned-app policy, prompt masking, and prompt-to-process investigation on the endpoint.", url: "https://www.youtube.com/watch?v=6ksNIbdRDwg" },
        { pillar: "ai", title: "Falcon Guardian: AIDR console walkthrough", type: "YouTube", domain: "Guardian", blurb: "Visibility dashboard, prompt-injection and secrets findings, then access and prompt rules with the policy sandbox. Filmed on the AIDR UI that Guardian replaces after 30 Nov 2026.", url: "https://www.youtube.com/watch?v=-UB4_qaqpww" },
        { pillar: "ai", title: "Falcon Guardian: Copilot Studio, Claude Code, and browser coverage", type: "YouTube", domain: "Guardian", blurb: "AIDR as an external threat detector in Copilot Studio, Claude Code hooks, and the Falcon browser extension for site and prompt rules.", url: "https://www.youtube.com/watch?v=HtIx-Aam0Ow" },
        { pillar: "ai", title: "Charlotte AI AgentWorks", type: "YouTube", domain: "Agentic SOAR", blurb: "Build and run a security workforce of Charlotte agents inside Falcon.", url: "https://www.youtube.com/watch?v=tk95k9MM8cQ" },
        { pillar: "ai", title: "Charlotte AI: write me a query", type: "Resource Center", domain: "AI-SecOps", blurb: "Plain-language query authoring for PowerShell execution on Windows.", url: "https://www.crowdstrike.com/en-us/resources/demos/conversations-with-charlotte-ai-writing-search-queries/" },
        { pillar: "ai", title: "Charlotte AI: am I vulnerable to Log4j?", type: "Resource Center", domain: "AI-SecOps", blurb: "Natural-language vulnerability and hunting questions in Charlotte.", url: "https://www.crowdstrike.com/en-us/resources/demos/conversations-with-charlotte-ai-assessing-potential-attacks/" },
        { pillar: "ai", title: "Falcon Exposure Management: AI inventory", type: "YouTube", domain: "AI inventory", blurb: "Host-level LLM, MCP, and IDE-extension inventory with Falcon for IT.", url: "https://www.youtube.com/watch?v=3Ti7tOVwAjo" },

        { pillar: "services", title: "Falcon Complete Hub", type: "YouTube", domain: "MDR", blurb: "Single landing page for Falcon Complete Next-Gen MDR actions, escalations, and coverage.", url: "https://www.youtube.com/watch?v=YymL4dpHNtg" },
        { pillar: "services", title: "Falcon Endpoint Protection Complete demo", type: "Resource Center", domain: "Managed endpoint", blurb: "Complete-tier endpoint demonstration of the managed service wrapping prevention and response.", url: "https://www.crowdstrike.com/resources/demos/demonstration-of-falcon-endpoint-protection-complete/" },

        { pillar: "infra", title: "Falcon for IT: accelerating AI discovery and governance", type: "YouTube", domain: "IT automation", blurb: "Find and govern AI running on hosts from the Falcon for IT surface.", url: "https://www.youtube.com/watch?v=XfIKimf49FU" },
        { pillar: "infra", title: "Falcon for IT: ask any question", type: "Resource Center", domain: "IT automation", blurb: "Instant fleet answers and software-package remediation on the existing sensor.", url: "https://www.crowdstrike.com/en-us/resources/demos/falcon-for-it-get-instant-answers-demo-drill-down/" },
        { pillar: "infra", title: "Falcon Discover IT hygiene", type: "YouTube", domain: "Asset inventory", blurb: "Devices, applications, and accounts for IT operations and hygiene.", url: "https://www.youtube.com/watch?v=xESb6eoC4HI" }
    ],
    howto: [
        { pillar: "endpoint", title: "Falcon Prevent: configure the NGAV prevention policy", type: "Tech Center", domain: "EPP / NGAV", blurb: "Tune sensor and cloud ML, ransomware and exploit mitigations, quarantine, and IOC blocking once the sensor is installed.", url: "https://www.crowdstrike.com/blog/tech-center/how-to-manage-policies-in-falcon/" },
        { pillar: "endpoint", title: "Falcon Insight XDR: deploy the sensor and EDR policies", type: "Tech Hub", domain: "EDR / XDR", blurb: "Roll out the Falcon sensor, prevention and update policies, uninstall protection, and Real Time Response.", url: "https://www.crowdstrike.com/tech-hub/endpoint-security/installing-falcon-sensor-for-linux/" },
        { pillar: "endpoint", title: "Falcon Insight XDR: connect third-party sources", type: "Tech Hub", domain: "XDR", blurb: "Wire third-party telemetry, CrowdStream/Cribl, and Fusion workflows for cross-domain detections.", url: "https://www.crowdstrike.com/tech-hub/ng-siem/seamless-data-onboarding-with-crowdstrike-falcon-next-gen-siem-and-cribl-via-crowdstream/" },
        { pillar: "endpoint", title: "Falcon for Mobile: deploy and set policy", type: "Product", domain: "MTD", blurb: "Enrol Android and iOS, set a privacy-aware mobile baseline, and optionally connect one MDM (Intune or Workspace ONE).", url: "https://www.crowdstrike.com/en-us/platform/endpoint-security/falcon-for-mobile/" },
        { pillar: "endpoint", title: "Falcon Firewall Management: rollout and requirements", type: "Product", domain: "Host firewall", blurb: "Map rules and policies before production, with per-OS sensor floors and the Firewall Manager role split from host-group creation.", url: "https://www.crowdstrike.com/en-us/platform/endpoint-security/falcon-firewall-management/" },
        { pillar: "endpoint", title: "Configure Falcon Device Control", type: "YouTube", domain: "USB / peripherals", blurb: "USB and peripheral policy setup, including Windows vs macOS enforcement timing.", url: "https://www.youtube.com/watch?v=CYnZdztL21k" },
        { pillar: "endpoint", title: "Contain an infected system", type: "YouTube", domain: "EDR response", blurb: "Network containment from the Falcon console.", url: "https://www.youtube.com/watch?v=9cM3TsHI56A" },
        { pillar: "endpoint", title: "Real Time Response remediation", type: "YouTube", domain: "RTR", blurb: "Remote investigation and remediation with Real Time Response.", url: "https://www.youtube.com/watch?v=eAQ3P11sfg4" },
        { pillar: "endpoint", title: "Hunt for indicators of compromise", type: "YouTube", domain: "Hunting", blurb: "IOC hunting in Falcon.", url: "https://www.youtube.com/watch?v=_t7n9i-cugg" },

        { pillar: "identity", title: "Falcon Identity Protection: ITDR deployment", type: "Tech Hub", domain: "ITDR", blurb: "Sensor on domain controllers, Entra ID via OIDC/EAM, MFA connectors, then policy rules starting in simulation mode.", url: "https://www.crowdstrike.com/tech-hub/identity-protection/crowdstrike-falcon-identity-protection-policies/" },
        { pillar: "identity", title: "Threat hunting with Falcon Identity Protection", type: "Tech Hub", domain: "ITDR", blurb: "Hunt identity attacks and wire endpoint plus identity detections through Falcon Fusion.", url: "https://www.crowdstrike.com/tech-hub/identity-protection/threat-hunting-with-falcon-identity-protection/" },
        { pillar: "identity", title: "Protect against exposed credentials with Identity and Recon", type: "Tech Hub", domain: "ITDR / CTI", blurb: "Send leaked passwords from Intelligence Recon into Identity Protection and enforce compromised-password policy.", url: "https://www.crowdstrike.com/tech-hub/identity-protection/protect-against-exposed-credentials-with-identity-and-recon/" },
        { pillar: "identity", title: "Falcon ID: phishing-resistant MFA", type: "Blog", domain: "MFA", blurb: "Public overview of FalconID passkeys in the Falcon for Mobile app. Console enrolment steps remain gated.", url: "https://www.crowdstrike.com/en-us/blog/crowdstrike-falcon-id-brings-phishing-resistant-mfa-to-falcon-next-gen-identity-security/" },

        { pillar: "cloud", title: "Falcon Cloud Security: shift left in the AWS CI/CD pipeline", type: "Tech Hub", domain: "CWPP / KSPM", blurb: "Image assessment and verified-image policy so only approved images reach hosts or Kubernetes.", url: "https://www.crowdstrike.com/tech-hub/cloud-security/shifting-left-with-the-crowdstrike-and-aws-ci-cd-pipeline/" },
        { pillar: "cloud", title: "Falcon Shield: onboard and connect SaaS apps", type: "Product", domain: "SSPM", blurb: "Access the Shield console, assign RBAC, allowlist region IPs, then connect apps over OAuth.", url: "https://www.crowdstrike.com/en-us/platform/falcon-shield/prevention-features/" },
        { pillar: "cloud", title: "Falcon Cloud Security Graph Explorer", type: "YouTube", domain: "CNAPP / CDR", blurb: "Walk internet-exposed workloads, missing sensors, and exploitable paths in one graph.", url: "https://www.youtube.com/watch?v=rEp8VCcvRX4" },

        { pillar: "data", title: "Scan endpoint data at rest with Falcon Data Protection", type: "Tech Hub", domain: "DLP", blurb: "Endpoint Data Discovery on sensor 7.28+: scan Windows hosts for PII, PCI, and custom classifications.", url: "https://www.crowdstrike.com/tech-hub/data-protection/scan-endpoint-data-at-rest-with-falcon-data-protection-for-endpoint-data-discovery/" },
        { pillar: "data", title: "AI-powered classifications for unstructured cloud data", type: "Tech Hub", domain: "DSPM", blurb: "How Falcon Data Protection for Cloud combines a language model with deterministic rules.", url: "https://www.crowdstrike.com/tech-hub/data-protection/ai-powered-classifications-for-unstructured-cloud-data/" },

        { pillar: "network", title: "Falcon Firewall Management: rollout and requirements", type: "Product", domain: "Host firewall", blurb: "The native network-adjacent control on the sensor. Map rule groups and policies before production.", url: "https://www.crowdstrike.com/en-us/platform/endpoint-security/falcon-firewall-management/" },
        { pillar: "network", title: "Falcon Seraphic Enterprise Browser", type: "Product", domain: "ZTNA / SEB", blurb: "Public product page for browser-native Zero Trust access. CrowdStrike has not published a standalone how-to for Secure Access.", url: "https://www.crowdstrike.com/en-us/platform/falcon-seraphic-enterprise-browser/" },

        { pillar: "email", title: "CrowdStrike Alliance Landscape", type: "Partner coverage", domain: "Email security", blurb: "No native Falcon email how-to in CyberDoc. Cover email and collaboration via alliance partners.", url: "../../Research/infosec-solutions-map/" },

        { pillar: "secops", title: "Falcon Next-Gen SIEM: data onboarding", type: "Tech Hub", domain: "SIEM", blurb: "Connectors, Falcon Log Collector, and third-party ingest into Next-Gen SIEM.", url: "https://www.crowdstrike.com/tech-hub/ng-siem/harness-falcon-log-collector-for-seamless-third-party-data-collection/" },
        { pillar: "secops", title: "Falcon Next-Gen SIEM: HEC and parsers", type: "Developer", domain: "SIEM", blurb: "HTTP Event Collector ingest and CrowdStrike Parsing Standard (ECS-based) reference.", url: "https://developer.crowdstrike.com/ngsiem/data-ingestion/" },
        { pillar: "secops", title: "Falcon Onum: deploy and build a first pipeline", type: "Docs", domain: "Data pipeline", blurb: "Cloud vs on-prem Onum, login, then Listener → Actions → Data Sink.", url: "https://docs.onum.com/getting-started-with-falcon-onum.md" },
        { pillar: "secops", title: "Charlotte AI: enable and operate in the SOC", type: "Tech Hub", domain: "Agentic SOAR", blurb: "Where Charlotte surfaces, promptbooks, Detection Triage guardrails, and Fusion agentic steps.", url: "https://www.crowdstrike.com/tech-hub/charlotte-ai/" },

        { pillar: "intel", title: "Identify internet asset risks with Falcon Exposure Management", type: "Tech Hub", domain: "CTEM / EASM", blurb: "Unpack internet-facing assets, risk scores, and exposed services from the Exposure Management console.", url: "https://www.crowdstrike.com/tech-hub/exposure-management/identifying-internet-asset-risks-with-falcon-exposure-management/" },
        { pillar: "intel", title: "Falcon Spotlight: operate vulnerability management", type: "Tech Hub", domain: "Vulnerability management", blurb: "Exposure Management hub for Spotlight-style vulnerability and configuration assessment. Console enablement remains gated.", url: "https://www.crowdstrike.com/tech-hub/exposure-management/" },
        { pillar: "intel", title: "Falcon Surface: internet exposure identification", type: "YouTube", domain: "EASM", blurb: "Outside-in asset discovery is covered in the Exposure Management in-action demo (native EASM).", url: "https://www.youtube.com/watch?v=MZOqAyUI1VY" },

        { pillar: "ot", title: "Falcon for XIoT: collectors, DataShipper, and OT proxy", type: "YouTube", domain: "OT / IoT", blurb: "Public demo of collector schedules, subnet coverage, and asset graphs. Detailed proxy/DataShipper steps are gated.", url: "https://www.youtube.com/watch?v=OdKihYqy9hc" },
        { pillar: "ot", title: "Falcon Discover API (IoT inventory)", type: "Developer", domain: "IoT", blurb: "Public API surface over Discover collections that XIoT inventory also uses.", url: "https://developer.crowdstrike.com/api-reference/collections/discover/" },

        { pillar: "appsec", title: "Falcon Shield: onboard and connect SaaS apps", type: "Product", domain: "SaaS apps", blurb: "RBAC, OAuth app connection, and alert/ticket channels for SSPM.", url: "https://www.crowdstrike.com/en-us/platform/falcon-shield/prevention-features/" },
        { pillar: "appsec", title: "Falcon Seraphic Enterprise Browser", type: "Product", domain: "Secure browser", blurb: "Application-edge Zero Trust in the existing browser. No public console how-to yet.", url: "https://www.crowdstrike.com/en-us/platform/falcon-seraphic-enterprise-browser/" },

        { pillar: "grc", title: "Falcon Discover: deployment and activation", type: "YouTube", domain: "IT hygiene / CMDB", blurb: "Sensor-based inventory of devices, applications, and accounts. Unmanaged discovery needs Discover or Exposure Management.", url: "https://www.youtube.com/watch?v=xESb6eoC4HI" },
        { pillar: "grc", title: "Falcon for IT: roles, policies, and automation", type: "Developer", domain: "Endpoint operations", blurb: "No extra agent: IT Automation policy plus a Response policy on the existing sensor. Public API reference for automation.", url: "https://developer.crowdstrike.com/api-reference/collections/it-automation/" },
        { pillar: "grc", title: "Falcon for IT: ask any question", type: "Resource Center", domain: "Endpoint operations", blurb: "Public demo of real-time fleet questions and package remediation.", url: "https://www.crowdstrike.com/en-us/resources/demos/falcon-for-it-get-instant-answers-demo-drill-down/" },

        { pillar: "ai", title: "Charlotte AI: AI-SecOps deployment", type: "Tech Hub", domain: "AI-SecOps", blurb: "Enable Charlotte, use promptbooks, adopt Detection Triage with guardrails, and wire agents into Fusion.", url: "https://www.crowdstrike.com/tech-hub/charlotte-ai/" },
        { pillar: "ai", title: "Falcon Guardian on Kubernetes", type: "Blog", domain: "Guardian", blurb: "Prompt-layer detection for AI apps using the Falcon container sensor path. Published under the AIDR name before the Guardian rename.", url: "https://www.crowdstrike.com/en-us/blog/falcon-aidr-detects-threats-at-prompt-layer-in-kubernetes-ai-apps/" },
        { pillar: "ai", title: "Falcon Guardian: AIDR becomes Guardian", type: "Press", domain: "Guardian", blurb: "Public notice that AIDR customers move to Falcon Guardian; the AIDR UI is retired after 30 Nov 2026.", url: "https://www.crowdstrike.com/en-us/press-releases/crowdstrike-unveils-falcon-guardian-ai-agent-security/" },

        { pillar: "services", title: "Falcon Complete Hub", type: "YouTube", domain: "MDR", blurb: "How customers use the Complete Hub landing page for escalations, coverage, and analyst actions. Onboarding is CrowdStrike-led.", url: "https://www.youtube.com/watch?v=YymL4dpHNtg" },
        { pillar: "services", title: "Stopping cross-domain attacks with OverWatch", type: "YouTube", domain: "Managed hunting", blurb: "Platform incident plus the OverWatch hunting dashboard for expert-led coverage across domains.", url: "https://www.youtube.com/watch?v=31ivWoyxvek" },

        { pillar: "infra", title: "Falcon for IT: roles, policies, and automation", type: "Developer", domain: "IT automation", blurb: "Entitlement, RBAC, and the paired IT Automation plus Response policies on the existing sensor.", url: "https://developer.crowdstrike.com/api-reference/collections/it-automation/" },
        { pillar: "infra", title: "Falcon Discover: inventory for operations", type: "YouTube", domain: "Asset inventory", blurb: "IT hygiene dashboards for devices, applications, and accounts.", url: "https://www.youtube.com/watch?v=xESb6eoC4HI" },
        { pillar: "infra", title: "Falcon Onum: deploy and build a first pipeline", type: "Docs", domain: "Security data pipeline", blurb: "Stand up Onum and build a Listener → pipeline → Data Sink path upstream of Next-Gen SIEM.", url: "https://docs.onum.com/getting-started-with-falcon-onum.md" }
    ],
    tools: [
        { title: "FalconPy", type: "Python SDK", blurb: "Official CrowdStrike Falcon SDK for Python.", url: "https://github.com/CrowdStrike/falconpy" },
        { title: "PSFalcon", type: "PowerShell SDK", blurb: "Official Falcon SDK for PowerShell.", url: "https://github.com/CrowdStrike/psfalcon" },
        { title: "gofalcon", type: "Go SDK", blurb: "Official Falcon SDK for Go.", url: "https://github.com/CrowdStrike/gofalcon" },
        { title: "rusty-falcon", type: "Rust SDK", blurb: "Official Falcon SDK for Rust.", url: "https://github.com/CrowdStrike/rusty-falcon" },
        { title: "FalconJS", type: "JavaScript SDK", blurb: "Official Falcon SDK for JavaScript.", url: "https://github.com/CrowdStrike/falconjs" },
        { title: "falcon-scripts", type: "Install scripts", blurb: "Current public install/helper scripts for Falcon sensor deployment.", url: "https://github.com/CrowdStrike/falcon-scripts" },
        { title: "CrowdStrike on GitHub", type: "Organisation", blurb: "Public repos, tools, and samples from CrowdStrike.", url: "https://github.com/CrowdStrike" }
    ],
    more: [
        { title: "CrowdStrike Resource Center — Data Sheets", type: "Library", blurb: "Canonical public datasheet index. Use this if a SKU is newer than this page.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/" },
        { title: "White papers", type: "Library", blurb: "Public white-paper library.", url: "https://www.crowdstrike.com/en-us/resources/white-papers/" },
        { title: "Guides", type: "Library", blurb: "Public deployment and how-to guides.", url: "https://www.crowdstrike.com/en-us/resources/guides/" },
        { title: "Demos", type: "Library", blurb: "Public product demonstrations.", url: "https://www.crowdstrike.com/en-us/resources/demos/" },
        { title: "ThinkInfoSec alliance landscape", type: "Research", blurb: "70-domain native / hybrid / partner map this datasheet page sits beside.", url: "../../Research/infosec-solutions-map/" },
        { title: "Original helpful-links repo", type: "GitHub", blurb: "CrowdStrike’s public markdown library this page updates.", url: "https://github.com/CrowdStrike/helpful-links" }
    ]
};
