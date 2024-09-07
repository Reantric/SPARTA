import SetCoverer from "./SetCoverer/setCover.js";
import { Node, Severity } from "./Structures/Node.js";
import NodeManager from "./Structures/NodeManager.js";
import { LEFT, Methods, findNodeWithMinX, BELOW, findNodeWithMaxY } from "./Util/Methods.js";
import { ContextMenu } from "./Structures/ContextMenu.js";
import { Camera as Camera2D} from "./Structures/Camera.js";
import Draggable from "./Structures/Draggable.js";
import { Menu } from "./WebUtil/Menu.js";
import { Loader } from "./Util/Loader.js";

declare global {
    namespace p5 {
        interface p5InstanceExtensions {
            transformedMouseX: number;
            transformedMouseY: number;
            camera2D: Camera2D;
        }
    }
} 

let dc: p5;

/**
 * Sets the global p5 instance to the provided instance.
 * @param {p5} p - The p5 instance to be set as the global drawing canvas.
 */
export function setDrawingCanvas(p: p5) {
    dc = p;
}

/**
 * Retrieves the global p5 instance.
 * @returns {p5} - The global p5 instance.
 */
export function getDrawingCanvas() {
    return dc;
}

/**
 * Retrieves the left menu instance.
 */
export function getMenu() {
    return leftMenu;
}

const nodeManager = new NodeManager();
const rawData = `
RD-0001	Acquire Infrastructure	CWE-200, CWE-287, CWE-1390, CWE-300, CWE-327, CWE-522		
IA-0012	Assembly	CWE-1294, CWE-200		
IA-0011	Auxiliary Device Compromise	CWE-1294, CWE-200		
PER-0002	Backdoor	CWE-118, CWE-138, CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-119, CWE-172, CWE-200, CWE-667, CWE-662, CWE-362, CWE-665, CWE-506, CWE-732, CWE-696, CWE-228, CWE-269, CWE-287, CWE-311, CWE-326, CWE-327, CWE-330, CWE-345, CWE-362, CWE-400, CWE-573, CWE-669, CWE-671, CWE-684, CWE-913, CWE-922, CWE-1023, CWE-1263, CWE-1391		
DE-0008	Bootkit	CWE-287, CWE-506, CWE-514		
DE-0009	Camouflage, Concealment, and Decoys (CCD)	CWE-287, CWE-1390, CWE-330, CWE-345		
EX-0004	Compromise Boot Memory	CWE-668		
IA-0007	Compromise Ground Station	CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-696, CWE-602, CWE-285, CWE-311, CWE-330, CWE-345, CWE-666, CWE-668, CWE-669, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390		
IA-0006	Compromise Hosted Payload	CWE-732, CWE-285, CWE-404, CWE-200, CWE-653, CWE-668, CWE-669, CWE-862, CWE-1263, CWE-696, CWE-913		
RD-0002	Compromise Infrastructure	CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-696, CWE-602, CWE-285, CWE-311, CWE-330, CWE-345, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390		
IA-0002	Compromise Software Defined Radio	CWE-506, CWE-1263, CWE-285, CWE-345, CWE-1384		
IA-0003	Compromise Software Defined Radio	CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-602, CWE-285, CWE-311, CWE-330, CWE-345, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390, CWE-696		
EXF-0008	Compromised Developer Site	CWE-200, CWE-345, CWE-506, CWE-669, CWE-913, CWE-732, CWE-287		
EXF-0010	Compromised Developer Site	CWE-287, CWE-200, CWE-327, CWE-311, CWE-913, CWE-522		
EXF-0007	Compromised Ground System	CWE-287, CWE-200, CWE-1390, CWE-311, CWE-922, CWE-522		
EXF-0009	Compromised Partner Site	CWE-345, CWE-669		
IA-0001	Compromised Supply Chain	CWE-118, CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-119, CWE-172, CWE-200, CWE-667, CWE-662, CWE-362, CWE-665, CWE-506, CWE-732, CWE-1263, CWE-269, CWE-287, CWE-311, CWE-326, CWE-327, CWE-330, CWE-345, CWE-400, CWE-573, CWE-668, CWE-669, CWE-671, CWE-684, CWE-696, CWE-913, CWE-922, CWE-1023, CWE-139		
LM-0003	Constellation Hopping via Crosslink	CWE-200, CWE-923, CWE-326, CWE-327, CWE-287, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-696, CWE-602, CWE-285, CWE-311, CWE-330, CWE-345, CWE-346, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390		
IMP-0001	Deception (or Misdirection)	CWE-287, CWE-300, CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-118, CWE-119, CWE-172, CWE-200, CWE-667, CWE-662, CWE-362, CWE-665, CWE-923, CWE-326, CWE-327, CWE-642, CWE-346, CWE-732, CWE-522, CWE-514, CWE-696, CWE-285, CWE-345, CWE-228, CWE-400, CWE-200, CWE-269, CWE-311, CWE-330, CWE-610, CWE-653, CWE-657, CWE-662, CWE-666, CWE-668, CWE-669, CWE-671, CWE-684, CWE-754, CWE-755, CWE-863, CWE-913, CWE-922, CWE-1023, CWE-1263, CWE-1384, CWE-1390, CWE-1391		
IMP-0004	Degradation	CWE-138, CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-118, CWE-119, CWE-172, CWE-667, CWE-662, CWE-362, CWE-665, CWE-506, CWE-732, CWE-1263, CWE-228, CWE-269, CWE-285, CWE-287, CWE-311, CWE-326, CWE-327, CWE-330, CWE-345, CWE-400, CWE-610, CWE-642, CWE-657, CWE-669, CWE-671, CWE-684, CWE-696, CWE-704, CWE-834, CWE-913, CWE-922, CWE-1023, CWE-1384, CWE-1391		
IMP-0003	Denial	CWE-138, CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-118, CWE-119, CWE-172, CWE-667, CWE-662, CWE-362, CWE-665, CWE-506, CWE-732, CWE-1263, CWE-119, CWE-228, CWE-269, CWE-285, CWE-287, CWE-311, CWE-326, CWE-327, CWE-330, CWE-345, CWE-400, CWE-610, CWE-642, CWE-657, CWE-669, CWE-671, CWE-696, CWE-704, CWE-834, CWE-913, CWE-922, CWE-1023, CWE-1384, CWE-1391, CWE-684		
IMP-0005	Destruction	CWE-287, CWE-300, CWE-20, CWE-269, CWE-311, CWE-345, CWE-346, CWE-610, CWE-642, CWE-653, CWE-657, CWE-665, CWE-666, CWE-668, CWE-684, CWE-922, CWE-923, CWE-1390		
DE-0001	Disable Fault Management	CWE-665, CWE-345, CWE-311, CWE-922, CWE-684, CWE-287, CWE-665, CWE-667		
EX-0006	Disable/Bypass Encryption	CWE-326, CWE-327, CWE-330, CWE-522, CWE-77, CWE-20, CWE-311, CWE-200, CWE-287, CWE-345, CWE-665, CWE-684, CWE-922, CWE-667, CWE-74		
IMP-0002	Disruption	CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-118, CWE-119, CWE-172, CWE-667, CWE-662, CWE-362, CWE-665, CWE-506, CWE-732, CWE-1263, CWE-345, CWE-400, CWE-610, CWE-642, CWE-657, CWE-669, CWE-671, CWE-684, CWE-696, CWE-704, CWE-834, CWE-913, CWE-922, CWE-1023, CWE-1384, CWE-1391		
EXF-0003	Eavesdropping	CWE-200, CWE-327, CWE-923, CWE-326, CWE-311, CWE-346, CWE-330, CWE-665		
REC-0005	Eavesdropping	CWE-200, CWE-327, CWE-923, CWE-326, CWE-311, CWE-665, CWE-330, CWE-346		
EX-0009	Exploit Code Flaws	CWE-74, CWE-20, CWE-77, CWE-114, CWE-912, CWE-404, CWE-118, CWE-119, CWE-172, CWE-200, CWE-667, CWE-662, CWE-362, CWE-665, CWE-138, CWE-228, CWE-269, CWE-287, CWE-311, CWE-330, CWE-345, CWE-400, CWE-573, CWE-610, CWE-642, CWE-657, CWE-669, CWE-671, CWE-684, CWE-696, CWE-704, CWE-834, CWE-913, CWE-922, CWE-1023, CWE-1263, CWE-1391		
EX-0005	Exploit Hardware/Firmware Corruption	CWE-77, CWE-20, CWE-1263, CWE-74		
LM-0002	Exploit Lack of Bus Segregation	CWE-732, CWE-285, CWE-404, CWE-200, CWE-653, CWE-668, CWE-669, CWE-862, CWE-1263, CWE-696, CWE-913		
DE-0005	Exploit Reduced Protections During Safe-Mode	CWE-327, CWE-326, CWE-311, CWE-200, CWE-287, CWE-330, CWE-345, CWE-665, CWE-667, CWE-684, CWE-922		
EX-0011	Exploit Reduced Protections During Safe-Mode	CWE-327, CWE-923, CWE-326, CWE-311, CWE-200, CWE-287, CWE-330, CWE-345, CWE-346, CWE-665, CWE-684, CWE-922, CWE-667		
IA-0010	Exploit Reduced Protections During Safe-Mode	CWE-287, CWE-311, CWE-345, CWE-665, CWE-667, CWE-684, CWE-922		
EX-0013	Flooding	CWE-200, CWE-311, CWE-287, CWE-345, CWE-667, CWE-684, CWE-665		
REC-0006	Gather FSW Development Information	CWE-74, CWE-20, CWE-200		
REC-0004	Gather Launch Information	CWE-20, CWE-269, CWE-287, CWE-311, CWE-345, CWE-610, CWE-642, CWE-657, CWE-684, CWE-922		
REC-0009	Gather Mission Information	CWE-20, CWE-269, CWE-610, CWE-642, CWE-657, CWE-287		
REC-0003	Gather Spacecraft Communications Information	CWE-200, CWE-327, CWE-285, CWE-300, CWE-522		
REC-0002	Gather Spacecraft Descriptors	CWE-200, CWE-285, CWE-522		
REC-0001	Gather Spacecraft Design Information	CWE-20, CWE-200, CWE-269, CWE-287, CWE-311, CWE-345, CWE-610, CWE-642, CWE-657, CWE-684, CWE-922		
REC-0008	Gather Supply Chain Information	CWE-200		
REC-0011	Gather Supply Chain Information	CWE-913		
REC-0012	Gather Supply Chain Information	CWE-922		
REC-0013	Gather Supply Chain Information	CWE-327		
REC-0014	Gather Supply Chain Information	CWE-522		
PER-0003	Ground System Presence	CWE-287, CWE-200, CWE-1390, CWE-311		
LM-0001	Hosted Payload	CWE-732, CWE-285, CWE-200, CWE-404, CWE-653, CWE-668, CWE-696, CWE-862, CWE-913, CWE-1263, CWE-669		
EX-0010	Inject Malicious Code	CWE-506, CWE-732, CWE-114, CWE-669, CWE-326, CWE-327, CWE-345, CWE-573		
EX-0016	Jamming	CWE-285, CWE-287, CWE-923, CWE-326, CWE-441, CWE-346, CWE-400, CWE-642		
EX-0017	Kinetic Physical Attack	CWE-287, CWE-330, CWE-400		
LM-0006	Launch Vehicle	CWE-287, CWE-1390, CWE-330, CWE-732, CWE-116, CWE-326, CWE-424		
DE-0004	Masquerading	CWE-287, CWE-1390, CWE-300		
PER-0001	Memory Compromise	CWE-345, CWE-669		
EX-0003	Modify Authentication Process	CWE-326, CWE-327, CWE-330, CWE-522, CWE-77, CWE-20, CWE-74, CWE-200, CWE-665		
DE-0003	Modify On-Board Values	CWE-287, CWE-300, CWE-662, CWE-665, CWE-362, CWE-326, CWE-327, CWE-311, CWE-1390, CWE-666, CWE-346, CWE-923, CWE-345, CWE-922, CWE-684, CWE-668, CWE-653, CWE-404, CWE-200, CWE-1384, CWE-285, CWE-326, CWE-330		
EX-0012	Modify On-Board Values	CWE-287, CWE-300, CWE-662, CWE-665, CWE-362, CWE-200, CWE-404, CWE-20, CWE-269, CWE-285, CWE-311, CWE-345, CWE-346, CWE-610, CWE-642, CWE-653, CWE-657, CWE-666, CWE-668, CWE-669, CWE-684, CWE-922, CWE-923, CWE-1384, CWE-1390		
EXF-0006	Modify Software Defined Radio	CWE-506, CWE-1263, CWE-285, CWE-345, CWE-669, CWE-1384		
DE-0006	Modify Whitelist	CWE-669, CWE-345		
REC-0007	Monitor for Safe-Mode Indicators	CWE-200, CWE-327, CWE-923, CWE-326, CWE-311, CWE-665, CWE-287, CWE-330, CWE-345, CWE-346, CWE-684, CWE-922		
EX-0018	Non-Kinetic Physical Attack	CWE-119, CWE-311, CWE-346, CWE-923, CWE-514		
RD-0003	Obtain Cyber Capabilities	CWE-119, CWE-200, CWE-287, CWE-1390, CWE-327, CWE-400, CWE-913		
RD-0005	Obtain Non-Cyber Capabilities	CWE-285, CWE-287, CWE-311		
EXF-0004	Out-of-Band Communications Link	CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-602, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-311, CWE-285, CWE-330, CWE-345, CWE-665, CWE-666, CWE-668, CWE-754, CWE-755, CWE-863, CWE-1390, CWE-696		
DE-0010	Overflow Audit Log	CWE-221, CWE-116, CWE-400		
EX-0002	Position, Navigation, and Timing (PNT) Geofencing	CWE-506, CWE-732, CWE-114, CWE-269, CWE-657, CWE-610, CWE-642, CWE-20, CWE-345, CWE-326, CWE-327, CWE-573, CWE-669		
DE-0002	Prevent Downlink	CWE-200		
EXF-0005	Proximity Operations	CWE-1294, CWE-200, CWE-327, CWE-923, CWE-326, CWE-311, CWE-330, CWE-346		
IA-0005	Rendezvous & Proximity Operations	CWE-1294, CWE-200, CWE-1294		
PER-0004	Replace Cryptographic Keys	CWE-326, CWE-327, CWE-330, CWE-522, CWE-923, CWE-287, CWE-200, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-514, CWE-696, CWE-602, CWE-665, CWE-666, CWE-285, CWE-311, CWE-327, CWE-345, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913		
EX-0001	Replay	CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-696, CWE-285, CWE-300, CWE-311, CWE-326, CWE-327, CWE-330, CWE-345, CWE-514, CWE-642, CWE-732, CWE-754, CWE-755, CWE-863, CWE-1390, CWE-602, CWE-77		
EXF-0001	Replay	CWE-200, CWE-285, CWE-346, CWE-732, CWE-327, CWE-923, CWE-326, CWE-311, CWE-287, CWE-330, CWE-1390, CWE-668		
IA-0008	Rogue External Entity	CWE-200, CWE-923, CWE-326, CWE-327, CWE-287, CWE-642, CWE-346, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-696, CWE-285, CWE-345, CWE-200, CWE-311, CWE-330, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390		
DE-0007	Rootkit	CWE-287, CWE-200, CWE-1390, CWE-330, CWE-913, CWE-506		
IA-0004	Secondary/Backup Communication Channel	CWE-287, CWE-200, CWE-311, CWE-330, CWE-1390		
EX-0015	Side-Channel Attack	CWE-200, CWE-1294, CWE-327, CWE-923, CWE-326, CWE-311, CWE-330, CWE-665		
EXF-0002	Side-Channel Attack	CWE-200, CWE-1294, CWE-327, CWE-923, CWE-326, CWE-311, CWE-330, CWE-665		
EX-0014	Spoofing	CWE-287, CWE-300, CWE-665, CWE-345, CWE-404, CWE-200, CWE-285, CWE-311, CWE-346, CWE-668, CWE-684, CWE-922, CWE-923, CWE-1384, CWE-1390		
RD-0004	Stage Capabilites	CWE-200, CWE-287, CWE-311, CWE-400, CWE-913, CWE-514		
IMP-0006	Theft	CWE-326, CWE-327, CWE-330, CWE-522, CWE-200, CWE-506, CWE-732, CWE-114, CWE-923, CWE-287, CWE-642, CWE-346, CWE-77, CWE-300, CWE-514, CWE-696, CWE-311, CWE-20, CWE-269, CWE-311, CWE-345, CWE-346, CWE-610, CWE-642, CWE-653, CWE-657, CWE-665, CWE-666, CWE-668, CWE-684, CWE-922, CWE-923, CWE-1390		
EX-0008	Time Synchronized Execution	CWE-662, CWE-665, CWE-362, CWE-200, CWE-285, CWE-287, CWE-345, CWE-1384, CWE-669		
EX-0007	Trigger Single Event Upset	CWE-665, CWE-345, CWE-922, CWE-684, CWE-667		
IA-0009	Trusted Relationship	CWE-506, CWE-732, CWE-114, CWE-326, CWE-327, CWE-345, CWE-669		
DE-0011	Valid Credentials	CWE-287, CWE-1390, CWE-573, CWE-311		
LM-0007	Valid Credentials	CWE-287, CWE-1390, CWE-573, CWE-311, CWE-522		
PER-0005	Valid Credentials	CWE-287, CWE-1390, CWE-287, CWE-522		
LM-0005	Virtualization Escape	CWE-287, CWE-441, CWE-1390, CWE-330, CWE-653, CWE-790		
LM-0004	Visiting Vehicle Interface(s)	CWE-1294, CWE-923, CWE-326, CWE-327, CWE-287, CWE-200, CWE-642, CWE-346, CWE-602, CWE-77, CWE-732, CWE-300, CWE-522, CWE-514, CWE-696, CWE-666, CWE-285, CWE-311, CWE-330, CWE-345, CWE-668, CWE-754, CWE-755, CWE-863, CWE-913, CWE-1390
`;

// Process the raw data
const SPARTAIdentifiersT = rawData.trim().split('\n').map(line => {
    const [id, info, cwes] = line.split('\t');
    return {
        id,
        info,
        cwes: cwes.split(', ').map(cwe => cwe.trim())
    };
});

const SPARTAIdentifiers = SPARTAIdentifiersT
//console.log(SPARTAIdentifiers);

const rawSbDData = `
Dynamic Reconfiguration	Make changes to individual systems, system elements, components, or sets of resources to change functionality or behavior without interrupting service.			
Dynamic Resource Allocation	Change the allocation of resources to tasks or functions without terminating critical functions or processes.			
Adaptive Management	Change how mechanisms are used based on changes in the operational environment as well as changes in the threat environment.			
Monitoring and Damage Assessment	Monitor and analyze behavior and characteristics of components and resources to look for indicators of adversary activity or precursor conditions or indications of other threat events and to detect and assess damage from adversity.			
Sensor Fusion and Analysis	Fuse and analyze monitoring data and analysis results from different information sources or at different times together with externally provided threat intelligence.			
Forensic and behavioral analysis	Analyze indicators and adversary TTPs, including observed behavior, malware, and other artifacts left behind by adverse events.			
Dynamic Resource Awareness	Maintain current information about resources, the status of resources, and resource connectivity.			
Dynamic Threat Awareness	Maintain current information about threat actors, indicators, and potential, predicted, and observed adverse events.			
Mission dependency and status visualization	Maintain current information about the status of missions or business functions, dependencies on resources, and the status of those resources with respect to threats.			
Calibrated Defense in Depth	Provide complementary protective mechanisms at different architectural layers or in different locations, calibrating the strength and number of mechanisms to resource value.			
Consistency Analysis	Determine whether and how protections can be applied in a coordinated, consistent way that minimizes interference, potential cascading failures, or coverage gaps.			
Orchestration	Coordinate modifications to and the ongoing behavior of mechanisms and processes at different layers, in different locations, or implemented for different aspects of trustworthiness to avoid causing cascading failures, interference, or coverage gaps.			
Self Challenge	Affect mission or business processes or system elements adversely in a controlled manner to validate the effectiveness of protections and enable proactive response and improvement.			
Obfuscation	Hide, transform, or otherwise obscure the contents, properties, or presence of information or other assets from the adversary.			
Disinformation	Provide deliberately misleading information to adversaries.			
Misdirection	Maintain deception resources or environments, and direct adversary activities there.			
Tainting	Embed covert capabilities in resources.			
Architectural Diversity	Use multiple sets of technical standards, different technologies, and different architectural patterns.			
Design Diversity	Use different designs within a given architecture to meet the same requirements or provide equivalent functionality.			
Synthetic Diversity	Transform implementations of software to produce a variety of instances.			
Information Diversity	Provide information from different sources or transform information in different ways.			
Path Diversity	Provide multiple independent paths for command, control, and communications.			
Supply Chain Diversity	Use multiple independent supply chains for critical components.			
Functional Relocation of Sensors	Relocate sensors or reallocate responsibility for specific sensing tasks to look for indicators of adverse events.			
Functional Relocation of Cyber resources	Change the location of cyber resources that provide functionality or information, either by moving the assets or by transferring functional responsibility.			
Asset Mobility	Securely move physical resources.			
Fragmentation	Partition information and distribute it across multiple components.			
Distributed Functionality	Decompose a function or application into smaller functions, and distribute those functions across multiple components.			
Non-persistent Information	Refresh information periodically, or generate information on demand and delete it when no longer needed.			
Non-persistent Services	Refresh services periodically, or generate services on demand and terminate services when no longer needed.			
Non-persistent Connectivity	Establish connections on demand, and terminate connections when no longer needed.			
Trust-based Privilege Management	Define, assign, and maintain privileges based on established trust criteria consistent with the principles of least privilege.			
Attribute-based Usage Restriction	Define, assign, maintain, and apply usage restrictions on cyber resources based on the criticality of missions or business functions and other attributes (e.g., data sensitivity).			
Dynamic Privileges	Elevate or decrease privileges assigned to a user, process, or service based on transient or contextual factors.			
Purposing	Ensure that cyber resources are used consistently with mission or business function purposes and approved uses, thereby avoiding unnecessary sharing and complexity.			
Offloading	Offload supportive but nonessential functions to other systems or to an external provider that is better able to perform the functions securely.			
Restriction	Remove or disable unneeded functionality or connectivity, or add mechanisms to reduce the chance of vulnerability or failure.			
Replacement	Replace low-assurance or poorly understood implementations with trustworthy implementations.			
Specialization	Uniquely augment, configure, or modify the design of critical cyber resources for missions or business functions to improve trustworthiness.			
Evolvability	Provide mechanisms and structure resources to enable the system to be maintained, modified, extended, or used in new ways without increasing security or mission risk.			
Protected backup and restore	Back up information and software (including configuration data and virtualized resources) in a way that protects its confidentiality, integrity, and authenticity. Enable safe and secure restoration in case of disruption or corruption.			
Surplus Capacity	Maintain extra capacity for information storage, processing, or communications.			
Replication	Duplicate hardware, information, backups, or functionality in multiple locations, and keep them synchronized.			
Predefined Segmentation	Define enclaves, segments, micro-segments, or other restricted types of resource sets based on criticality and trustworthiness so that they can be protected separately and, if necessary, isolated.			
Dynamic Segmentation and Isolation	Change the configuration of enclaves or protected segments, or isolate resources while minimizing operational disruption.			
Provenance Tracking	Identify and track the provenance of data, software, or hardware elements.			
Integrity Checks	Apply and validate checks of the integrity or quality of information, components, or services to guard against surreptitious modification.			
Behavior Validation	Validate the behavior of a system, service, device, or individual user against defined or emergent criteria (e.g., requirements, patterns of prior usage).			
Temporal Unpredictability	Change behavior or state at times that are determined randomly or by complex functions.			
Contextual Unpredictability	Change behavior or state in ways that are determined randomly or by complex functions.			
`;

// Process the raw data
const SbDIdentifiersT = rawSbDData.trim().split('\n').map((line, index) => {
    const [name, description] = line.split('\t');
    return {
        id: `SbD-${String(index + 1).padStart(3, '0')}`, // Generate SbD-### ID format
        info: `${name}: ${description}`
    };
});

const SbDIdentifiers = SbDIdentifiersT;
//console.log(SbDIdentifiers);

// Dynamically create CWEIdentifiers from SPARTA mappings (updated with real data)
const CWEIdentifiers = [...new Set(SPARTAIdentifiers.flatMap(sparta => sparta.cwes))];

// Map CWEs to the relevant SbD identifiers (updated based on the data)
// https://replit.com/@setupchess/PointlessSilkyComment
const SbDDescriptionsToIds = {};

SbDIdentifiers.forEach(sbd => {
    const [title] = sbd.info.split(':'); // Extract everything before the colon as the title
    SbDDescriptionsToIds[title.trim()] = sbd.id; // Trim any extra spaces and map to the SbD ID
});

console.log(SbDDescriptionsToIds);
const rawCWEData = `
CWE-20	Improper Input Validation	The software does not validate or incorrectly validates input, allowing an attacker to cause unexpected behavior.	Adaptive Management, Consistency Analysis, Restriction	
CWE-99	Improper Control of Resource Identifiers ('Resource Injection')	The software does not properly validate resource identifiers, allowing an attacker to access unintended resources.	Consistency Analysis, Restriction, Replacement	
CWE-159	Failure to Sanitize Special Elements	The software fails to properly sanitize special elements, leading to security vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-185	Incorrect Enclosure of Document Element	The software incorrectly encloses document elements, causing data corruption or exposure.	Integrity Checks, Consistency Analysis, Replacement	
CWE-200	Exposure of Sensitive Information to an Unauthorized Actor	The software exposes sensitive information to an actor that is not explicitly authorized to have access to that information.	Obfuscation, Disinformation, Attribute-based Usage Restriction	
CWE-221	Information Exposure Through Log Files	The software improperly logs sensitive information, making it accessible to unauthorized actors.	Protected Backup and Restore, Obfuscation, Attribute-based Usage Restriction	
CWE-228	Improper Handling of Syntactically Incorrect Structure	The software does not properly handle syntactically incorrect structures, causing unexpected behavior.	Consistency Analysis, Restriction, Replacement	
CWE-269	Improper Privilege Management	The software does not properly manage privileges, allowing users to gain unauthorized privileges.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-271	Privilege Dropping / Lowering Errors	The software does not properly drop or lower privileges, leading to security vulnerabilities.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-282	Improper Ownership Management	The software does not properly manage ownership of objects, allowing unauthorized users to assume control of those objects.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-285	Improper Authorization	The software does not properly restrict access to certain resources, which allows users to perform actions that they should not be authorized to perform.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-286	Incorrect User Management	The software incorrectly manages user roles and permissions, which can allow unauthorized users to gain elevated privileges.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-287	Improper Authentication	The software does not properly verify the identity of a user, which can allow unauthorized users to access sensitive information or functionality.	Trust-based Privilege Management, Dynamic Privileges, Behavioral Validation	
CWE-326	Inadequate Encryption Strength	The software uses an encryption algorithm that is not strong enough to protect the data from attackers with sufficient resources to decrypt it.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-327	Use of a Broken or Risky Cryptographic Algorithm	The software uses a cryptographic algorithm that is known to be broken or has significant risks, making it susceptible to attackers.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-330	Use of Insufficiently Random Values	The software uses predictable or insufficiently random values in security-critical operations, which can be exploited by attackers.	Temporal Unpredictability, Contextual Unpredictability, Synthetic Diversity	
CWE-345	Insufficient Verification of Data Authenticity	The software does not sufficiently verify the origin or authenticity of data, allowing an attacker to introduce malicious data.	Provenance Tracking, Integrity Checks, Dynamic Threat Awareness	
CWE-346	Origin Validation Error	The software does not properly verify the origin of data or communications, which can allow attackers to bypass security measures.	Provenance Tracking, Integrity Checks, Dynamic Threat Awareness	
CWE-362	Concurrent Execution using Shared Resource with Improper Synchronization ('Race Condition')	The software has a race condition, leading to unexpected behavior or security vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-377	Insecure Temporary File	The software creates or uses temporary files in an insecure manner, making it susceptible to unauthorized access or modification.	Protected Backup and Restore, Consistency Analysis, Restriction	
CWE-402	Transmission of Private Resources into a New Sphere ('Resource Leak')	The software leaks resources into an unintended sphere, exposing them to unauthorized actors.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-404	Improper Resource Shutdown or Release	The software does not properly release or shutdown resources after they have been used, leading to resource leaks or other unintended behavior.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-405	Asymmetric Resource Consumption ('Amplification')	The software consumes resources asymmetrically, leading to potential denial of service.	Surplus Capacity, Dynamic Resource Awareness, Adaptive Management	
CWE-407	Algorithmic Complexity	The software uses algorithms with high complexity, leading to performance degradation or security vulnerabilities.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-424	Improper Protection of Alternate Path	The software does not properly protect alternate paths used to access resources or perform actions, allowing an attacker to bypass security measures.	Dynamic Segmentation and Isolation, Path Diversity, Obfuscation	
CWE-436	Interpretation Conflict	The software has conflicts in interpreting data or instructions, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-441	Unintended Proxy or Intermediary ('Confused Deputy')	The software allows itself to be used as a proxy or intermediary in an unintended way, leading to security vulnerabilities.	Trust-based Privilege Management, Dynamic Privileges, Behavioral Validation	
CWE-446	UI Discrepancy	The software has discrepancies in its user interface, leading to security vulnerabilities.	Consistency Analysis, Behavioral Validation, Restriction	
CWE-451	User Interface (UI) Misrepresentation of Critical Information	The software misrepresents critical information in its user interface, leading to security vulnerabilities.	Consistency Analysis, Behavioral Validation, Restriction	
CWE-514	Covert Channel	The software contains covert channels, allowing unauthorized information flow.	Obfuscation, Disinformation, Attribute-based Usage Restriction	
CWE-522	Insufficiently Protected Credentials	The software does not sufficiently protect credentials, allowing attackers to obtain them and impersonate users or systems.	Protected Backup and Restore, Attribute-based Usage Restriction, Dynamic Privileges	
CWE-573	Improper Following of Specification by Caller	The software does not follow its specification properly, leading to security vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-610	Externally Controlled Reference to a Resource in Another Sphere	The software allows an attacker to control references to resources in another sphere, leading to unauthorized access.	Consistency Analysis, Restriction, Replacement	
CWE-642	External Control of Critical State Data	The software allows an attacker to modify critical state data, potentially leading to unauthorized actions or information disclosure.	Consistency Analysis, Restriction, Replacement	
CWE-653	Insufficient Compartmentalization	The software does not sufficiently separate data or control flows, allowing unauthorized users to access sensitive information or functionality.	Dynamic Segmentation and Isolation, Path Diversity, Consistency Analysis	
CWE-657	Violation of Secure Design Principles	The software violates secure design principles, leading to security vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-662	Improper Synchronization	The software does not properly synchronize shared resources, leading to unexpected behavior or security vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-665	Improper Initialization	The software does not properly initialize variables or data structures, leading to security vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-666	Improper Handling of Parameters	The software does not properly handle parameters, leading to security vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-668	Exposure of Resource to Wrong Sphere	The software exposes resources to the wrong sphere, making them accessible to unauthorized actors.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-669	Incorrect Resource Transfer Between Spheres	The software incorrectly transfers resources between spheres, leading to security vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-670	Always-Incorrect Control Flow Implementation	The software has control flow implementations that are always incorrect, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-671	Incorrect Conversion between Numeric Types	The software incorrectly converts between numeric types, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-672	Operation on a Resource after Expiration or Release	The software performs operations on resources after they have been expired or released, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-673	External Control of Critical State Data	The software allows an attacker to modify critical state data, potentially leading to unauthorized actions or information disclosure.	Consistency Analysis, Restriction, Replacement	
CWE-684	Incorrect Assignment	The software incorrectly assigns values, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-696	Incorrect Behavior Order	The software executes behaviors in an incorrect order, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-706	Use of Incorrectly-Resolved Name or Reference	The software uses incorrectly-resolved names or references, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-754	Improper Check for Unusual or Exceptional Conditions	The software does not properly check for unusual or exceptional conditions, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-755	Improper Handling of Exceptional Conditions	The software does not properly handle exceptional conditions, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-758	Reliance on Undefined, Unspecified, or Implementation-Defined Behavior	The software relies on behavior that is undefined, unspecified, or implementation-defined, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-799	Improper Control of Interaction Frequency	The software does not properly control interaction frequency, leading to performance degradation or security vulnerabilities.	Surplus Capacity, Dynamic Resource Awareness, Adaptive Management	
CWE-862	Missing Authorization	The software does not perform an authorization check when a user attempts to access a restricted resource or perform a sensitive action.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-863	Incorrect Authorization	The software improperly authorizes a user, allowing them to access functionality or information that they should not be able to access.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-913	Improper Control of Dynamically-Managed Code Resources	The software does not properly control dynamically-managed code resources, leading to unexpected behavior or vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-923	Improper Restriction of Communication Channel to Intended Endpoints	The software does not properly restrict communication channels to intended endpoints, leading to unauthorized access.	Path Diversity, Obfuscation, Attribute-based Usage Restriction	
CWE-1004	Sensitive Cookie Without 'HttpOnly' Flag	The software uses cookies that do not have the 'HttpOnly' flag, making them accessible to client-side scripts.	Protected Backup and Restore, Attribute-based Usage Restriction, Dynamic Privileges	
CWE-1059	Missing Documentation for Security-Relevant Decisions	The software does not document security-relevant decisions, leading to potential vulnerabilities.	Provenance Tracking, Integrity Checks, Consistency Analysis	
CWE-1076	Path Traversal: '.../...//' (double dot slash)	The software allows path traversal using '.../...//', leading to unauthorized access.	Consistency Analysis, Restriction, Replacement	
CWE-1177	Unnecessary Use of Privileged Account	The software unnecessarily uses a privileged account, leading to potential security vulnerabilities.	Trust-based Privilege Management, Dynamic Privileges, Attribute-based Usage Restriction	
CWE-1229	Creation of Chroot Jail Without Changing Working Directory	The software creates a chroot jail without changing the working directory, leading to security vulnerabilities.	Consistency Analysis, Dynamic Resource Awareness, Restriction	
CWE-1357	Improper Verification of Cryptographic Signature	The software does not properly verify cryptographic signatures, leading to potential vulnerabilities.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-1384	Improper Neutralization of Special Elements in Data Query Logic	The software does not properly neutralize special elements in data query logic, leading to vulnerabilities.	Consistency Analysis, Restriction, Replacement	
CWE-1390	Use of Weak Cryptographic Key	The software uses a weak cryptographic key, leading to potential vulnerabilities.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-1391	Use of Weak Hash Function	The software uses a weak hash function, leading to potential vulnerabilities.	Replacement, Synthetic Diversity, Attribute-based Usage Restriction	
CWE-1931	Use of Observable Response Discrepancy	The software uses observable response discrepancies, leading to potential vulnerabilities.	Obfuscation, Disinformation, Attribute-based Usage Restriction
`;

// Step 3: Process the raw CWE data
const CWEToSbDMap = {};

rawCWEData.trim().split('\n').forEach(line => {
    const [cweId, , , sbds] = line.split('\t'); // Split the CWE entry
    const sbdList = sbds.split(', ').map(sbd => SbDDescriptionsToIds[sbd.trim()]).filter(Boolean); // Map descriptions to SbD IDs
    CWEToSbDMap[cweId] = sbdList; // Map CWE ID to the list of SbD IDs
});

Object.keys(CWEToSbDMap).forEach(cweId => {
    if (!CWEIdentifiers.includes(cweId)) {
        CWEIdentifiers.push(cweId);
    }
});

let universeSize = CWEIdentifiers.length;

// Create mappings from identifiers to numeric indices
const SbDToIndex = Object.fromEntries(SbDIdentifiers.map((id, index) => [id, index]));
const CWEToIndex = Object.fromEntries(CWEIdentifiers.map((id, index) => [id, index]));

// Create sets where each SbD maps to the CWEs it covers based on the CWEToSbDMap
const sets = SbDIdentifiers.map(sbd => {
    const cwesForSbD = Object.entries(CWEToSbDMap)
        .filter(([, sbds]: [string, unknown[]]) => (sbds as string[]).includes(sbd.id))
        .map(([cwe]) => CWEToIndex[cwe]);
    return cwesForSbD;
});

/**
     * Retrieves and combines the information of all SPARTA IDs associated with a CWE.
     * @param {string} cweId - The CWE ID.
     * @returns {string} - Combined information from all SPARTA IDs.
     */
function getCWEInfo(cweId: string): string {
    const spartaInfo = SPARTAIdentifiers
        .filter(sparta => sparta.cwes.includes(cweId))
        .map(sparta => `${sparta.id}: ${sparta.info}`)
        .join('\n');
    return spartaInfo ? spartaInfo : `No SPARTA info for ${cweId}`;
}

/**
 * Retrieves the information associated with an SbD from the SbDIdentifiers list.
 * @param {string} sbdId - The SbD ID.
 * @returns {string} - The information related to the SbD.
 */
function getSbDInfo(sbdId: string): string {
    const sbd = SbDIdentifiers.find(s => s.id === sbdId);
    return sbd ? sbd.info : `No SbD info for ${sbdId}`;
}

const setWeights = [];
const universeNodes = [];
const setNodes = [];

let leftMenu: Menu;
/**
 * Main sketch function for p5 instance mode.
 * @param {p5} p - The p5 instance.
 */
function sketch(p: p5) {
    p.transformedMouseX = 0;
    p.transformedMouseY = 0;
    /**
     * Updates the transformed mouse coordinates based on the camera's position and zoom level.
     */
    function updateTransformedMouseCoords() {
        const camera = p.camera2D;
        let camPos = camera.getPosition();
        p.transformedMouseX = (p.mouseX - camPos.x) / camera.getScale();
        p.transformedMouseY = (p.mouseY - camPos.y) / camera.getScale();
    }

    setDrawingCanvas(p);  // Set the global p5 instance
    Methods.init();

    /**
     * Handles window resizing to adjust the canvas size.
     */
    p.windowResized = function() {
        p.resizeCanvas(p.windowWidth - document.getElementById('menu').offsetWidth, p.windowHeight);
    }

    /**
     * Initializes the nodes and sets up their positions and relationships.
     */
    function init() {
        // Create universe nodes (CWE)
        const UPSHIFT = 180;
        const DIST = 180;
        CWEIdentifiers.forEach((id, i) => {
            const x = DIST / 2 + i * DIST;
            const y = UPSHIFT;
            const node = new Node(id, getCWEInfo(id), p.createVector(x, y));  // Use the actual CWE identifier as the title
            node.setSeverity(Severity.NONE);
            universeNodes.push(node);
            nodeManager.addNode(node);
        });
    
        // Create set nodes (SbD)
        SbDIdentifiers.forEach((sbd, i) => {
            //const x = p.map(i, 0, SbDIdentifiers.length - 1, 325, p.width - 325);
            const x = DIST / 2 + i * DIST;
            const y = UPSHIFT + 350;
            const node = new Node(sbd.id, getSbDInfo(sbd.id), p.createVector(x, y));  // Set SbD title and info
            node.setSbDStatus();
            let v = 1;//randint(1, 10);
            setWeights.push(v);
            node.setSeverity(v);
            nodeManager.addNode(node);
            setNodes.push(node);
        });
    
        // Connect set nodes to corresponding universe nodes
        sets.forEach((set, i) => {
            set.forEach(element => {
                setNodes[i].addChild(universeNodes[element]);
            });
        });
    }
    

    /**
     * Sets up the p5 sketch, including canvas creation and event listeners.
     */
    p.setup = function() {
    let loader = new Loader();
    loader.loadSPARTAData('sketch/data/spartadata.xlsx')
    .then(spartaData => {
        console.log(spartaData);
        // Now you can use spartaData in your sketch initialization
    })
    .catch(error => {
        console.error('Error loading SPARTA data:', error);
    });
        
        const menuWidth = document.getElementById('menu').offsetWidth;
        const canvasContainer = document.getElementById('canvas-container');
        
        // Adjust canvas size to leave space for the menu
        const canvas = p.createCanvas(p.windowWidth - menuWidth, p.windowHeight, p.P2D);
        canvas.parent('canvas-container');

        p.textFont('Lato');
        p.textAlign(p.CENTER);
        p.colorMode(p.HSB);

        init();
        p.camera2D = new Camera2D(p); // Initialize the camera
        leftMenu = new Menu(universeSize, sets, setWeights, nodeManager, setNodes, p);
        
        const menu = document.getElementById('menu');
        const resizeObserver = new ResizeObserver(() => {
            p.windowResized();
        });
        resizeObserver.observe(menu);

        // Listen for context menu option selection events
        window.addEventListener('contextmenuoption', (event: CustomEvent) => {
            console.log("FIRE!");
            const { eventName } = event.detail;
            handleContextMenuOption(eventName);
        });
    }

    /**
     * Initializes the drawing setup.
     */
    function drawInit() {
        p.textAlign(p.CENTER);
        p.background(235, 21, 21);
        updateTransformedMouseCoords();
    }

    /**
     * Main draw function for the p5 sketch.
     */
    p.draw = function() {
       // console.log(this.mouseX,this.mouseY,this.transformedMouseX, this.transformedMouseY);
        drawInit();

        p.push();
        p.camera2D.applyTransformations();  // Apply camera transformations

        p.fill(255);
        nodeManager.drawNodes();
        
        p.pop();  // Reset transformations for UI elements

        p.noStroke();
        p.fill(255);
        p.textAlign(p.LEFT);
        p.textSize(36);

        leftMenu.update(); // Handles a lot of the menu stuff, zooming, highlighting, etc.

        // Combine static and dynamic info
        let combinedInfoText = leftMenu.getCombinedText();
        
        // TODO: Wrap this in a function later
        const paddingCITextY = -100;  // Adjust padding as needed
        const paddingCITextX = 30;  // Adjust padding as needed
        const lines = combinedInfoText.split('\n');
        const textHeight = lines.length * (p.textAscent() + p.textDescent());
        p.text(combinedInfoText, paddingCITextX, p.height - paddingCITextY - textHeight);
    }

    /**
     * Handles mouse press events.
     */
    p.mousePressed = function() {
        const contextMenu = new ContextMenu();
        nodeManager.handleMousePress();

        if (p.mouseButton === p.RIGHT) {
            const clickedNode = nodeManager.nodes.find(node => node.isMouseOver());
            if (clickedNode) {
                // Handle right-click on the node
                clickedNode.handleMousePress(p.RIGHT);
            } else {
                // Handle right-click on the canvas (outside nodes)
                contextMenu.show(p.mouseX, p.mouseY, [
                    { label: "Preview", action: preview, icon: "uil uil-eye" },
                    // Add other default menu items here
                ]);
            }
            return false; // Prevent default context menu
        }

        // Handle left-clicks or other mouse actions if needed
    }

    /**
     * Handles mouse drag events for panning the camera.
     */
    let isPanning = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    p.mouseDragged = function() {
        if (this.mouseX < 0 || this.mouseX > this.width || this.mouseY < 0 || this.mouseY > this.height) 
            return;

        if (p.mouseButton === p.LEFT && !isPanning && !Draggable.isDraggingNode) {
            // Handle dragging the camera
            isPanning = true;
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
        } else if (isPanning) {
            const dx = p.mouseX - lastMouseX;
            const dy = p.mouseY - lastMouseY;
            p.camera2D.pan(dx, dy);
            lastMouseX = p.mouseX;
            lastMouseY = p.mouseY;
        }
    }

    p.mouseReleased = function() {
        isPanning = false;
        nodeManager.handleMouseRelease();
    }

    /**
     * Handles mouse wheel events for zooming the camera.
     */
    p.mouseWheel = function(event: WheelEvent) {
        const centerX = p.width / 2;
        const centerY = p.height / 2;
        const factor = event.deltaY > 0 ? 0.95 : 1.05;
        this.camera2D.zoom(factor, centerX, centerY);
        return false;  // Prevent page scroll
    }

    /**
     * Handles key press events.
     */
    p.keyPressed = function() {
        nodeManager.handleKeyPress(p.key);
    }

    /**
     * Handles context menu option selection.
     * @param {string} optionName - The name of the selected option.
     */
    function handleContextMenuOption(optionName: string) {
        console.log(`Context menu option selected: ${optionName}`);
        // Handle different context menu options here
        if (optionName === 'option1') {
            // Example: Select all nodes
            nodeManager.nodes.forEach(node => node.select());
        }
    }

    /**
     * Generates a random integer between two values.
     * @param {number} arg0 - The lower bound.
     * @param {number} arg1 - The upper bound.
     * @returns {number} - A random integer between arg0 and arg1.
     */
    function randint(arg0, arg1) {
        return Math.floor(Math.random() * (arg1 - arg0 + 1)) + arg0;
    }

    /**
     * Example function for the context menu option.
     */
    function preview() {
        console.log("Preview option selected");
        // Implement the action for the Preview option
    }

}

// @ts-ignore
new p5(sketch, "canvas-container");
