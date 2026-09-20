const DATASHEETS = [
    { pillar: "endpoint", title: "Falcon Prevent", domain: "EPP / NGAV", blurb: "AI-powered next-generation antivirus across Windows, macOS, and Linux.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-prevent/" },
    { pillar: "endpoint", title: "Falcon Insight XDR", domain: "EDR / XDR", blurb: "Endpoint telemetry, detection, investigation, and hunting on the Falcon platform.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-insight-xdr/" },
    { pillar: "endpoint", title: "Falcon for Mobile", domain: "MTD", blurb: "EDR for iOS and Android from the same Falcon console.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-for-mobile/" },
    { pillar: "endpoint", title: "Falcon Firewall Management", domain: "Host firewall", blurb: "Central policy and visibility for native OS host firewalls.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-firewall-management/" },
    { pillar: "endpoint", title: "Falcon Device Control", domain: "USB / peripherals", blurb: "Visibility and control for USB, SD, Bluetooth, and Thunderbolt storage.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-device-control/" },

    { pillar: "identity", title: "Falcon Next-Gen Identity Security", domain: "Continuous Identity", blurb: "Identity control plane for human, non-human, and AI identities.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-next-gen-identity-security/" },
    { pillar: "identity", title: "Falcon Identity Threat Protection", domain: "ITDR", blurb: "Detect and stop identity-based breaches with risk-based access.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-identity-threat-protection/" },
    { pillar: "identity", title: "Falcon Complete Identity Threat Protection", domain: "Managed ITDR", blurb: "Managed identity threat prevention and IT policy enforcement.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete-identity-threat-protection/" },

    { pillar: "cloud", title: "Falcon Cloud Security", domain: "CNAPP", blurb: "Unified posture (USPM) and cloud runtime protection across hybrid cloud.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-cloud-security/" },
    { pillar: "cloud", title: "Falcon Cloud Security: CDR", domain: "CDR", blurb: "Real-time cloud detection and response correlated with endpoint and identity.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-cloud-security-cloud-detection-and-response-cdr/" },
    { pillar: "cloud", title: "Falcon Complete Cloud Security", domain: "Managed CWPP", blurb: "24/7 managed cloud workload protection with OverWatch hunting.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete-cloud-security/" },
    { pillar: "cloud", title: "Falcon Shield", domain: "SSPM", blurb: "SaaS security posture, identities, and SaaS-to-SaaS exposure from one dashboard.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-shield-comprehensive-saas-security/" },

    { pillar: "data", title: "Falcon Data Security for Endpoint", domain: "DLP", blurb: "Classify data and stop theft across web, GenAI, removable media, printers, and local apps.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-data-security-for-endpoint/" },
    { pillar: "data", title: "Falcon Data Security for Cloud", domain: "DSPM", blurb: "Discover, classify, and watch sensitive data movement across cloud APIs, SaaS, and databases.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-data-security-for-cloud/" },
    { pillar: "data", title: "Falcon Data Protection", domain: "Unified data protection", blurb: "Endpoint-to-cloud data protection on the same Falcon sensor, including GenAI leak prevention.", url: "https://www.crowdstrike.com/en-gb/resources/data-sheets/falcon-data-protection/" },

    { pillar: "network", title: "Falcon Secure Access / Seraphic Enterprise Browser", domain: "ZTNA / SEB", blurb: "Browser-native Zero Trust access, phishing/session-hijack defence, and GenAI governance.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-secure-access/" },
    { pillar: "network", title: "Falcon Firewall Management", domain: "Host firewall", blurb: "Also listed under Endpoint — the native network-adjacent control on the sensor.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-firewall-management/" },

    { pillar: "email", title: "CrowdStrike Alliance Landscape", domain: "Partner coverage", blurb: "Email security is partner-led in the GTM catalogue. See the ThinkInfoSec alliance map for current partners.", url: "../../Research/infosec-solutions-map/" },

    { pillar: "secops", title: "Falcon Next-Gen SIEM", domain: "SIEM", blurb: "Cloud-native SIEM that extends Falcon detections, intel, and response to all data sources.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-next-gen-siem/" },
    { pillar: "secops", title: "Falcon Next-Gen SIEM for Third Party", domain: "Open SOC", blurb: "Unify third-party endpoint telemetry, starting with Microsoft Defender, into Falcon SIEM.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-next-gen-siem-for-third-party/" },
    { pillar: "secops", title: "Falcon Next-Gen SIEM Detections", domain: "Detection content", blurb: "High-confidence, intel-driven detections and ATT&CK-mapped coverage for the SOC.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-next-gen-siem-detections/" },
    { pillar: "secops", title: "Falcon LogScale", domain: "Log management", blurb: "Centralised log management that underpins the Next-Gen SIEM data plane.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-logscale/" },
    { pillar: "secops", title: "Charlotte AI", domain: "Agentic SOAR", blurb: "Falcon-native agents, AgentWorks, and Charlotte Agentic SOAR for SOC automation.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/charlotte-ai/" },
    { pillar: "secops", title: "Falcon Complete", domain: "MDR", blurb: "Agentic MDR: 24/7 experts plus automation for full-cycle remediation.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete/" },
    { pillar: "secops", title: "Falcon Adversary OverWatch", domain: "Managed hunting", blurb: "24/7 human-led hunting across endpoint, identity, cloud, and Next-Gen SIEM data.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-adversary-overwatch/" },

    { pillar: "intel", title: "Falcon Exposure Management", domain: "CTEM", blurb: "Continuous, adversary-informed exposure management and risk prioritisation.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-exposure-management/" },
    { pillar: "intel", title: "Falcon Spotlight", domain: "Vulnerability management", blurb: "Scan-free endpoint vulnerability assessment on the Falcon sensor.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-spotlight/" },
    { pillar: "intel", title: "Falcon Surface", domain: "EASM", blurb: "Outside-in discovery of internet-facing assets, subsidiaries, and third parties.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-surface/" },
    { pillar: "intel", title: "Falcon Adversary Intelligence", domain: "CTI", blurb: "Personalised, workflow-ready threat intelligence for Falcon and third-party tools.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-adversary-intelligence/" },

    { pillar: "ot", title: "Falcon for XIoT", domain: "OT / IoT", blurb: "Visibility, prevention, and identity protection for connected operational assets.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-for-xiot/" },

    { pillar: "appsec", title: "Falcon Secure Access / Seraphic Enterprise Browser", domain: "Secure browser", blurb: "Application-edge control for SaaS, GenAI, and private apps without a traditional VDI stack.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-secure-access/" },
    { pillar: "appsec", title: "Falcon Shield", domain: "SaaS apps", blurb: "SSPM and SaaS identity/app governance — the SaaS side of application risk.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-shield-comprehensive-saas-security/" },

    { pillar: "grc", title: "Falcon Discover", domain: "IT hygiene / CMDB", blurb: "Real-time inventory of systems, applications, and accounts for IT and security.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-discover/" },
    { pillar: "grc", title: "Falcon for IT", domain: "Endpoint operations", blurb: "Real-time osquery, posture checks, and guarded remediation on the Falcon sensor.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-for-it/" },

    { pillar: "ai", title: "Falcon Guardian", domain: "AIDR", blurb: "CrowdStrike’s flagship AI detection and response SKU: shadow-AI discovery, prompt and data controls, and runtime protection for agents on the endpoint.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-guardian/" },
    { pillar: "ai", title: "Charlotte AI", domain: "AI-SecOps", blurb: "Agentic security for Falcon users — triage, malware analysis, and custom agents.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/charlotte-ai/" },
    { pillar: "ai", title: "Falcon Next-Gen Identity Security", domain: "AI identities", blurb: "Continuous Identity now explicitly covers AI-agent identities alongside humans and NHIs.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-next-gen-identity-security/" },

    { pillar: "services", title: "Falcon Complete", domain: "MDR", blurb: "Managed detection, response, and remediation across the Falcon attack surface.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete/" },
    { pillar: "services", title: "Falcon Complete Cloud Security", domain: "Managed cloud", blurb: "Managed CWP with hunting and the Breach Prevention Warranty.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete-cloud-security/" },
    { pillar: "services", title: "Falcon Complete Identity Threat Protection", domain: "Managed identity", blurb: "Fully managed identity protection layered on Falcon Complete.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-complete-identity-threat-protection/" },
    { pillar: "services", title: "Falcon Adversary OverWatch", domain: "Managed hunting", blurb: "Expert hunting as a service across Falcon domains.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-adversary-overwatch/" },

    { pillar: "infra", title: "Falcon for IT", domain: "IT automation", blurb: "Converge IT operations with security on the same lightweight sensor.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-for-it/" },
    { pillar: "infra", title: "Falcon Discover", domain: "Asset inventory", blurb: "IT hygiene and unmanaged-asset discovery feeding operations and exposure work.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/falcon-discover/" },
    { pillar: "infra", title: "Falcon Next-Gen SIEM", domain: "Security data pipeline", blurb: "Onum / NG-SIEM is the current public face of Falcon’s security data plane.", url: "https://www.crowdstrike.com/en-us/resources/data-sheets/crowdstrike-falcon-next-gen-siem/" }
];
