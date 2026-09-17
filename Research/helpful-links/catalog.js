const PILLARS = [
    { id: "endpoint", label: "Endpoint & Device", coverage: "native", note: "NGAV, EDR/XDR, mobile, host firewall, and USB/device control." },
    { id: "identity", label: "Identity & Access", coverage: "native", note: "ITDR and Continuous Identity. Falcon ID / Privileged Access sit in the same family; public datasheets below are the identity SKUs CrowdStrike currently publishes." },
    { id: "cloud", label: "Cloud Security", coverage: "native", note: "CNAPP / CSPM / CIEM / CWPP / KSPM / CDR plus Falcon Shield for SaaS posture." },
    { id: "data", label: "Data Security", coverage: "native", note: "Endpoint DLP, cloud DSPM, and the Data Protection family launched into this pillar." },
    { id: "network", label: "Network Security", coverage: "hybrid", note: "Native play is Falcon Secure Access (Seraphic enterprise browser / ZTNA). Host firewall is also listed under Endpoint. NDR/SASE/SWG remain partner-led." },
    { id: "email", label: "Email & Collaboration", coverage: "partner", note: "No native Falcon email SKU in the GTM catalogue. Cover this pillar via alliance partners (for example Abnormal Security) and the alliance landscape." },
    { id: "secops", label: "Security Operations", coverage: "native", note: "Next-Gen SIEM, Fusion / Charlotte Agentic SOAR, Falcon Complete MDR, and OverWatch." },
    { id: "intel", label: "Threat Intel & Exposure", coverage: "native", note: "CTEM, EASM, vulnerability management, CTI, and digital risk protection." },
    { id: "ot", label: "OT, IoT & Industrial", coverage: "native", note: "Falcon for XIoT covers connected OT/IoT assets on the Falcon platform." },
    { id: "appsec", label: "Application Security", coverage: "hybrid", note: "Native coverage is the enterprise browser / secure access control at the application edge. WAF, API security, and AST remain partner-led." },
    { id: "grc", label: "Governance, Risk & Compliance", coverage: "hybrid", note: "Falcon Discover is the native IT hygiene / CMDB-style inventory. Broader GRC/TPRM is partner or services." },
    { id: "ai", label: "AI & Agentic Security", coverage: "native", note: "Charlotte AI (agentic SOC) is native. Falcon Guardian / AIDR is the AI-application security SKU in the catalogue." },
    { id: "services", label: "Managed & Professional Services", coverage: "native", note: "Falcon Complete, OverWatch, and Falcon for MSSPs. IR/forensics remain CrowdStrike Services." },
    { id: "infra", label: "Cloud & Infra Ops", coverage: "native", note: "Falcon for IT (osquery / automation) plus Discover for asset inventory. Falcon Onum feeds the SIEM data pipeline." }
];
