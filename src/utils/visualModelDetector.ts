import type { EducationalVisualModel, VisualModelType, VisualizationType, TutorVisualSpec } from '../types';

/**
 * Educational Visual Models Knowledge Base
 * Defines high-fidelity, pedagogically verified animated visual models.
 */
export const VISUAL_MODELS_CATALOG: Record<VisualModelType, EducationalVisualModel> = {
  'cpu-architecture': {
    id: 'vm-cpu-arch',
    type: 'cpu-architecture',
    title: 'Von Neumann CPU Architecture & Instruction Cycle',
    category: 'Computer Science',
    caption: 'Visualizing the hardware data flow: RAM, Bus, Control Unit, ALU, and Registers.',
    summary: 'The CPU coordinates with RAM via system buses to execute instructions in four discrete phases: Fetch, Decode, Execute, and Writeback.',
    steps: [
      {
        stepNumber: 1,
        label: 'Fetch Cycle',
        description: 'The Program Counter (PC) provides the instruction memory address. The address travels via the Address Bus to RAM, and the instruction opcode is fetched across the Data Bus into the Instruction Register (IR).',
        activeElements: ['ram', 'address-bus', 'data-bus', 'pc', 'ir']
      },
      {
        stepNumber: 2,
        label: 'Decode Phase',
        description: 'The Control Unit (CU) interprets the instruction bits in the IR, determines the required operation and operand addresses, and prepares the control signals.',
        activeElements: ['cu', 'ir', 'control-bus']
      },
      {
        stepNumber: 3,
        label: 'ALU Execution',
        description: 'The Arithmetic Logic Unit (ALU) performs the mathematical or logical operation (e.g., addition, bitwise comparison) on data loaded into the Accumulator and data registers.',
        activeElements: ['alu', 'registers', 'accumulator']
      },
      {
        stepNumber: 4,
        label: 'Writeback & PC Increment',
        description: 'The computed result is written back to destination registers or RAM via the data bus, and the Program Counter increments to point to the subsequent instruction.',
        activeElements: ['registers', 'ram', 'data-bus', 'pc']
      }
    ],
    interactiveParams: {
      busClockSpeed: '2.4 GHz',
      wordSize: '64-bit',
      cacheLevel: 'L1 Data / L1 Code'
    }
  },

  photosynthesis: {
    id: 'vm-photosynthesis',
    type: 'photosynthesis',
    title: 'Photosynthesis: Light Reactions & The Calvin Cycle',
    category: 'Science & Biology',
    caption: 'How plant chloroplasts convert solar photons, water, and carbon dioxide into glucose and oxygen.',
    summary: 'Photosynthesis occurs in two interconnected stages: Light-dependent reactions in the thylakoid membranes, and light-independent reactions (Calvin cycle) in the stroma.',
    steps: [
      {
        stepNumber: 1,
        label: 'Photon Absorption & Water Photolysis',
        description: 'Sunlight strikes chlorophyll in Photosystem II (Thylakoid). Water molecules (H₂O) are split into electrons, protons, and oxygen gas (O₂), which is released.',
        activeElements: ['sunlight', 'h2o', 'chloroplast', 'thylakoid', 'o2']
      },
      {
        stepNumber: 2,
        label: 'Electron Transport & ATP Synthesis',
        description: 'Excited electrons flow down the electron transport chain, pumping H⁺ ions across the membrane to drive ATP Synthase and generate NADPH and ATP energy carriers.',
        activeElements: ['electron-chain', 'atp-synthase', 'atp', 'nadph']
      },
      {
        stepNumber: 3,
        label: 'Carbon Fixation (Calvin Cycle)',
        description: 'In the liquid stroma, the enzyme RuBisCO binds atmospheric carbon dioxide (CO₂) with ribulose bisphosphate (RuBP) to initiate the sugar-building cycle.',
        activeElements: ['co2', 'stroma', 'rubisco', 'calvin-cycle']
      },
      {
        stepNumber: 4,
        label: 'Glucose Synthesis & Starch Storage',
        description: 'ATP and NADPH reduce 3-PGA into high-energy G3P molecules, which combine to form glucose (C₆H₁₂O₆) for plant growth and cellular respiration.',
        activeElements: ['glucose', 'g3p', 'stroma']
      }
    ],
    interactiveParams: {
      lightIntensity: 'High (85%)',
      co2Concentration: '415 ppm',
      tempCelsius: '24°C'
    }
  },

  'water-cycle': {
    id: 'vm-water-cycle',
    type: 'water-cycle',
    title: 'Earth’s Hydrological Water Cycle',
    category: 'Science & Biology',
    caption: 'Continuous movement of water on, above, and below the surface of the Earth.',
    summary: 'Driven by solar energy and gravity, water continually shifts between liquid, vapor, and ice through evaporation, condensation, precipitation, and runoff.',
    steps: [
      {
        stepNumber: 1,
        label: 'Evaporation & Transpiration',
        description: 'Solar radiation warms ocean, lake, and soil surfaces, transforming liquid water into vapor that ascends into the lower atmosphere alongside transpiration from plant leaves.',
        activeElements: ['sun', 'ocean', 'vapor', 'plants']
      },
      {
        stepNumber: 2,
        label: 'Condensation & Cloud Formation',
        description: 'As warm moisture ascends into cooler, lower-pressure altitudes, water vapor condenses around microscopic aerosol particles to form clouds and fog.',
        activeElements: ['clouds', 'atmosphere', 'droplets']
      },
      {
        stepNumber: 3,
        label: 'Precipitation',
        description: 'When condensed water droplets in clouds become too dense to remain suspended by atmospheric updrafts, gravity pulls them down as rain, snow, sleet, or hail.',
        activeElements: ['rain', 'clouds', 'mountains']
      },
      {
        stepNumber: 4,
        label: 'Surface Runoff & Ground Infiltration',
        description: 'Precipitation flows downhill across rivers and streams into lakes and oceans, while a fraction infiltrates deep into subterranean aquifers as groundwater.',
        activeElements: ['river', 'ocean', 'groundwater', 'soil']
      }
    ],
    interactiveParams: {
      ambientTemp: '18°C',
      relativeHumidity: '68%',
      solarIrradiance: '1000 W/m²'
    }
  },

  'human-heart': {
    id: 'vm-human-heart',
    type: 'human-heart',
    title: 'Human Heart: 4-Chamber Cardiovascular Blood Flow',
    category: 'Science & Biology',
    caption: 'Dual-loop circulatory system: Pulmonary circulation (lungs) and Systemic circulation (body).',
    summary: 'The human heart acts as a double pump with four chambers: Right Atrium and Ventricle handle deoxygenated blood; Left Atrium and Ventricle pump oxygen-rich blood to the entire body.',
    steps: [
      {
        stepNumber: 1,
        label: 'Deoxygenated Venous Inflow',
        description: 'Oxygen-depleted blood from body tissues returns through the Superior and Inferior Vena Cava into the Right Atrium.',
        activeElements: ['vena-cava', 'right-atrium', 'tricuspid-valve']
      },
      {
        stepNumber: 2,
        label: 'Pulmonary Pumping to Lungs',
        description: 'The Right Ventricle contracts, pumping blue (deoxygenated) blood through the Pulmonary Valve and Pulmonary Artery directly to the lungs for gas exchange.',
        activeElements: ['right-ventricle', 'pulmonary-artery', 'lungs']
      },
      {
        stepNumber: 3,
        label: 'Oxygenated Pulmonary Inflow',
        description: 'Freshly oxygenated (red) blood returns from pulmonary capillaries via Pulmonary Veins into the Left Atrium, passing through the Mitral Valve.',
        activeElements: ['pulmonary-veins', 'left-atrium', 'mitral-valve']
      },
      {
        stepNumber: 4,
        label: 'Systemic Ventricular Ejection via Aorta',
        description: 'The muscular Left Ventricle delivers high-pressure contraction, propelling oxygen-rich blood through the Aortic Valve into the Aorta to supply vital organs and brain tissue.',
        activeElements: ['left-ventricle', 'aortic-valve', 'aorta', 'body-circulation']
      }
    ],
    interactiveParams: {
      bpm: 72,
      systolicPressure: '120 mmHg',
      diastolicPressure: '80 mmHg'
    }
  },

  'solar-system': {
    id: 'vm-solar-system',
    type: 'solar-system',
    title: 'Heliocentric Solar System Planetary Orbits',
    category: 'General',
    caption: 'Orbits, relative velocities, and scale of celestial bodies revolving around the Sun.',
    summary: 'Eight major planets orbit the central Sun governed by Kepler’s laws of planetary motion, with inner rocky planets orbiting rapidly and outer gas giants sweeping broad, slower arcs.',
    is3D: true,
    steps: [
      {
        stepNumber: 1,
        label: 'The Sun & Gravitational Well',
        description: 'The Sun comprises 99.86% of the solar system’s total mass, exerting gravitational dominance that curves spacetime and keeps all planetary bodies in stable elliptical orbits.',
        activeElements: ['sun', 'gravity-well']
      },
      {
        stepNumber: 2,
        label: 'Terrestrial Inner Planets',
        description: 'Mercury (88-day orbit), Venus, Earth (365.25 days), and Mars: compact, rocky worlds with solid silicate mantles orbiting within the inner solar boundary.',
        activeElements: ['mercury', 'venus', 'earth', 'mars', 'inner-orbits']
      },
      {
        stepNumber: 3,
        label: 'Asteroid Belt & Gas Giants',
        description: 'Beyond Mars lies the main asteroid belt, followed by massive Jupiter (11.8 Earth-year orbit) and Saturn with its prominent crystalline ring system.',
        activeElements: ['asteroid-belt', 'jupiter', 'saturn']
      },
      {
        stepNumber: 4,
        label: 'Ice Giants & Kuiper Rim',
        description: 'Uranus and Neptune orbit at immense cryogenic distances (up to 30 AU), surrounded by icy trans-Neptunian remnants at the solar system boundary.',
        activeElements: ['uranus', 'neptune', 'outer-boundary']
      }
    ],
    interactiveParams: {
      orbitSpeedMultiplier: '1x',
      scaleMode: 'Readable Pedagogical Scale',
      viewPerspective: '3D Angled Inclination'
    }
  },

  'neural-network': {
    id: 'vm-neural-network',
    type: 'neural-network',
    title: 'Deep Neural Network Forward Propagation & Synaptic Flow',
    category: 'Computer Science',
    caption: 'Interactive multilayer perceptron computing weighted dot products and activation outputs.',
    summary: 'Signals flow from input features through hidden neuron layers via weighted connections, modulated by non-linear activation functions (ReLU/Sigmoid) to produce predictions.',
    steps: [
      {
        stepNumber: 1,
        label: 'Input Feature Vector Injection',
        description: 'Raw normalized input features ($x_1, x_2, x_3$) enter the input layer nodes without transformation.',
        activeElements: ['input-layer', 'input-node-1', 'input-node-2', 'input-node-3']
      },
      {
        stepNumber: 2,
        label: 'Hidden Layer 1 Dot Product & ReLU Activation',
        description: 'Synaptic connections multiply inputs by weights ($w_{ij}$) and add biases ($b$). Neurons pass the sum through $\\text{ReLU}(z) = \\max(0, z)$ to activate key feature patterns.',
        activeElements: ['weights-1', 'hidden-layer-1', 'relu-activation']
      },
      {
        stepNumber: 3,
        label: 'Hidden Layer 2 High-Order Representation',
        description: 'Signals propagate to the second hidden tier, synthesizing abstract combinations and compositional hierarchies.',
        activeElements: ['weights-2', 'hidden-layer-2']
      },
      {
        stepNumber: 4,
        label: 'Softmax Output Probability Distribution',
        description: 'The final dense layer normalizes logits into class probabilities $\\sum p_k = 1.0$, producing the definitive model inference decision.',
        activeElements: ['weights-3', 'output-layer', 'softmax-prediction']
      }
    ],
    interactiveParams: {
      activationFunction: 'ReLU',
      learningRate: 0.01,
      networkTopology: '3 -> 4 -> 4 -> 2'
    }
  },

  'electric-circuit': {
    id: 'vm-electric-circuit',
    type: 'electric-circuit',
    title: 'DC Closed Circuit: Ohm’s Law & Electron Current Flow',
    category: 'Physics & Chemistry',
    caption: 'Interactive schematic demonstrating $V = I \\times R$, switch control, and power dissipation.',
    summary: 'A direct current (DC) circuit creates a closed loop where potential difference drives electron flow from negative to positive terminals through a load resistor and incandescent bulb.',
    steps: [
      {
        stepNumber: 1,
        label: 'Electromotive Force & Potential Difference',
        description: 'A 9V DC battery establishes an electrical potential difference (voltage) between its positive anode and negative cathode terminals.',
        activeElements: ['battery', 'voltage-source', 'positive-terminal', 'negative-terminal']
      },
      {
        stepNumber: 2,
        label: 'Switch Closure & Closed Conductive Path',
        description: 'Closing the switch completes the conductive copper circuit loop, enabling free electrons in the wire lattice to drift under the electric field.',
        activeElements: ['switch', 'closed-loop', 'conductors']
      },
      {
        stepNumber: 3,
        label: 'Current Regulation via Resistor (Ohm’s Law)',
        description: 'A current-limiting resistor impedes charge flow ($I = V/R$), preventing short-circuit overheating and setting safe milliampere throughput.',
        activeElements: ['resistor', 'electron-flow', 'ammeter']
      },
      {
        stepNumber: 4,
        label: 'Load Dissipation: Incandescent Luminescence',
        description: 'Electrons collide with tungsten filament atoms inside the light bulb, dissipating electrical energy as thermal heat and radiant visible photons.',
        activeElements: ['light-bulb', 'filament-glow', 'photons']
      }
    ],
    interactiveParams: {
      voltage: '9.0 V',
      resistance: '300 Ω',
      calculatedCurrent: '30.0 mA',
      switchState: 'Closed'
    }
  },

  'binary-search': {
    id: 'vm-binary-search',
    type: 'binary-search',
    title: 'Binary Search Algorithm: $O(\\log N)$ Divide & Conquer',
    category: 'Computer Science',
    caption: 'Halving search space on each step using Low, Mid, and High boundary pointers.',
    summary: 'Binary search targets a value in a sorted array by repeatedly inspecting the middle element, discarding half the remaining candidates on every comparison.',
    steps: [
      {
        stepNumber: 1,
        label: 'Initialize Search Range: Low & High Pointers',
        description: 'Set `low = 0` at the array beginning and `high = N - 1` at the end. Compute initial midpoint `mid = floor((low + high) / 2)`.',
        activeElements: ['low-pointer', 'high-pointer', 'mid-pointer', 'full-array']
      },
      {
        stepNumber: 2,
        label: 'Compare Mid Value with Search Target',
        description: 'Examine `array[mid]`. If `array[mid] < target`, the target must reside in the upper half. We discard the left partition and advance `low = mid + 1`.',
        activeElements: ['mid-element', 'discarded-left', 'new-low']
      },
      {
        stepNumber: 3,
        label: 'Narrow Search Interval (Halving Candidate Pool)',
        description: 'Recalculate `mid = floor((low + high) / 2)` over the remaining sub-array. The search space has contracted by 50% in a single step.',
        activeElements: ['new-mid', 'active-range']
      },
      {
        stepNumber: 4,
        label: 'Target Element Located (Exact Match)',
        description: '`array[mid] === target`. The algorithm successfully returns the element index with only $\\lceil \\log_2 N \\rceil$ total comparisons.',
        activeElements: ['target-found', 'success-index']
      }
    ],
    interactiveParams: {
      dataset: [2, 5, 8, 12, 16, 23, 38, 45, 56, 72, 91],
      searchTarget: 23,
      timeComplexity: 'O(log N)'
    }
  },

  'js-promise-flow': {
    id: 'vm-js-promise-flow',
    type: 'js-promise-flow',
    title: 'JavaScript Promise Lifecycle & Microtask Event Loop',
    category: 'Computer Science',
    caption: 'State transitions: Pending → Fulfilled/Rejected, and Microtask Queue draining priority.',
    summary: 'Promises represent eventual completion of asynchronous operations. Their reaction handlers (.then / .catch) bypass the macrotask queue to run immediately when the call stack clears.',
    steps: [
      {
        stepNumber: 1,
        label: 'Pending State & Async Execution',
        description: 'A Promise starts in the `Pending` state. The asynchronous operation (e.g. `fetch` or timer) is initiated in host Web APIs without blocking the main JavaScript call stack.',
        activeElements: ['pending-state', 'web-api', 'call-stack']
      },
      {
        stepNumber: 2,
        label: 'State Settlement: Fulfilled or Rejected',
        description: 'Upon completion, the promise settles irreversibly into either `Fulfilled` (with payload data) or `Rejected` (with an error reason).',
        activeElements: ['settled-state', 'fulfilled-node', 'resolved-value']
      },
      {
        stepNumber: 3,
        label: 'Microtask Queue Dispatch',
        description: 'The `.then(onFulfilled)` reaction callback is placed onto the high-priority Microtask Queue. It does NOT wait for timer macrotasks.',
        activeElements: ['microtask-queue', 'then-callback']
      },
      {
        stepNumber: 4,
        label: 'Event Loop Call Stack Drain',
        description: 'The Event Loop checks the Call Stack. Once synchronous frames exit, ALL pending microtasks are drained completely before the browser renders or runs `setTimeout`.',
        activeElements: ['event-loop', 'call-stack', 'microtask-drain']
      }
    ],
    interactiveParams: {
      promiseState: 'Fulfilled',
      queueType: 'Microtask Queue',
      settledValue: '{"status": 200, "ok": true}'
    }
  },

  'sql-join-venn': {
    id: 'vm-sql-join-venn',
    type: 'sql-join-venn',
    title: 'Relational Database SQL Joins: Interactive Venn Model',
    category: 'Computer Science',
    caption: 'Comparing INNER, LEFT, RIGHT, and FULL OUTER joins across relational tables.',
    summary: 'SQL joins correlate rows between two tables based on matching foreign key conditions, determining which matched or unmatched records are retained in the result set.',
    steps: [
      {
        stepNumber: 1,
        label: 'Table A & Table B Schemas',
        description: 'Table A (`Users`: `id`, `name`) and Table B (`Orders`: `order_id`, `user_id`, `amount`) represent independent relational entities with overlapping keys.',
        activeElements: ['table-a', 'table-b', 'foreign-key']
      },
      {
        stepNumber: 2,
        label: 'INNER JOIN (Intersection Only)',
        description: 'Returns only rows where the join condition `Users.id = Orders.user_id` matches in BOTH tables. Unmatched users and orphaned orders are excluded.',
        activeElements: ['inner-intersection', 'matched-rows']
      },
      {
        stepNumber: 3,
        label: 'LEFT JOIN (All Left + Matched Right)',
        description: 'Retains EVERY row from Table A (`Users`). If a user has no orders in Table B, the order columns populate with `NULL`.',
        activeElements: ['all-left', 'inner-intersection', 'null-right']
      },
      {
        stepNumber: 4,
        label: 'FULL OUTER JOIN (Complete Set)',
        description: 'Returns all records when there is a match in either left or right table, filling missing pairs with `NULL` on whichever side lacks corresponding data.',
        activeElements: ['full-union', 'left-nulls', 'right-nulls']
      }
    ],
    interactiveParams: {
      activeJoinType: 'INNER JOIN',
      tableARows: 4,
      tableBRows: 5,
      matchedRows: 3
    }
  },

  'os-scheduling': {
    id: 'vm-os-scheduling',
    type: 'os-scheduling',
    title: 'Operating System CPU Scheduling & Round Robin Timeline',
    category: 'Engineering',
    caption: 'Gantt chart visualization of process queues, context switching, and time quantum slices.',
    summary: 'The OS CPU scheduler allocates core execution time among concurrent processes in the Ready Queue, balancing turnaround time, fairness, and responsiveness.',
    steps: [
      {
        stepNumber: 1,
        label: 'Ready Queue Enqueue',
        description: 'Processes P1 (burst 6ms), P2 (burst 3ms), and P3 (burst 4ms) enter the kernel Ready Queue awaiting CPU core dispatch.',
        activeElements: ['ready-queue', 'process-p1', 'process-p2', 'process-p3']
      },
      {
        stepNumber: 2,
        label: 'Time Quantum Dispatch (Slice = 2ms)',
        description: 'The short-term scheduler dispatches Process P1 to the CPU core. P1 executes for exactly one time slice (2ms quantum).',
        activeElements: ['cpu-core', 'p1-running', 'quantum-timer']
      },
      {
        stepNumber: 3,
        label: 'Timer Interrupt & Context Switch',
        description: 'The hardware timer interrupt fires. The kernel saves P1 register state to its PCB, moves P1 to the queue tail, and dispatches P2.',
        activeElements: ['context-switch', 'pcb-save', 'p2-dispatch']
      },
      {
        stepNumber: 4,
        label: 'Process Completion & Gantt Chart Record',
        description: 'P2 finishes its remaining burst, releases resources, enters the Terminated state, and the Gantt chart timeline logs the execution sequence.',
        activeElements: ['p2-terminated', 'gantt-chart', 'timeline-complete']
      }
    ],
    interactiveParams: {
      algorithm: 'Round Robin (RR)',
      timeQuantum: '2 ms',
      contextSwitchOverhead: '0.1 ms'
    }
  },

  'pythagorean-theorem': {
    id: 'vm-pythagorean-theorem',
    type: 'pythagorean-theorem',
    title: 'Geometric Pythagorean Theorem: $a^2 + b^2 = c^2$',
    category: 'Mathematics',
    caption: 'Geometric proof showing unit area squares constructed on right-angled triangle sides.',
    summary: 'For any right-angled triangle, the area of the square whose side is the hypotenuse ($c$) is equal to the sum of the areas of the squares on the other two legs ($a$ and $b$).',
    steps: [
      {
        stepNumber: 1,
        label: 'Right-Angled Triangle Foundation',
        description: 'Consider a right triangle with perpendicular base leg $a = 3$ units, altitude leg $b = 4$ units, and right angle $\\angle C = 90^\\circ$.',
        activeElements: ['triangle-base', 'triangle-altitude', 'right-angle-marker']
      },
      {
        stepNumber: 2,
        label: 'Construct Squares on Legs $a$ and $b$',
        description: 'Build a square of side $a$ ($3 \\times 3 = 9$ square units) and a square of side $b$ ($4 \\times 4 = 16$ square units). Total leg area = $9 + 16 = 25$.',
        activeElements: ['square-a', 'square-b', 'grid-cells-a', 'grid-cells-b']
      },
      {
        stepNumber: 3,
        label: 'Hypotenuse Measurement ($c$)',
        description: 'The hypotenuse $c$ connects the opposite vertices. Constructing a square on side $c$ yields dimensions $5 \\times 5 = 25$ square units.',
        activeElements: ['hypotenuse-c', 'square-c']
      },
      {
        stepNumber: 4,
        label: 'Area Equivalence Proof ($9 + 16 = 25$)',
        description: 'The 9 red unit tiles and 16 blue unit tiles rearrange to perfectly tile the 25 purple squares on hypotenuse $c$. Thus, $a^2 + b^2 = c^2$.',
        activeElements: ['area-proof', 'tiled-cells', 'q-e-d']
      }
    ],
    interactiveParams: {
      legA: 3,
      legB: 4,
      hypotenuseC: 5,
      formula: '3² + 4² = 9 + 16 = 25 = 5²'
    }
  },

  'generic-process-flow': {
    id: 'vm-generic-process',
    type: 'generic-process-flow',
    title: 'Educational Concept Process Flow & Architecture',
    category: 'General',
    caption: 'Dynamic sequential phase progression and architectural state transitions.',
    summary: 'A structured breakdown tracking inputs, transformation milestones, feedback loops, and final deliverable outputs.',
    steps: [
      {
        stepNumber: 1,
        label: 'Input & Initialization',
        description: 'Initial state parameters and prerequisite resources are loaded into the processing environment.',
        activeElements: ['node-init', 'stage-1']
      },
      {
        stepNumber: 2,
        label: 'Transformation & Analysis',
        description: 'Core logic, algorithmic mutations, or state transformations are applied sequentially.',
        activeElements: ['node-transform', 'stage-2']
      },
      {
        stepNumber: 3,
        label: 'Verification & Quality Check',
        description: 'Intermediate outcomes are evaluated against validation boundaries and invariant constraints.',
        activeElements: ['node-verify', 'stage-3']
      },
      {
        stepNumber: 4,
        label: 'Output & Completion',
        description: 'The final stabilized output artifact is generated and persisted for downstream consumers.',
        activeElements: ['node-output', 'stage-4']
      }
    ],
    interactiveParams: {
      pipelineStages: 4,
      mode: 'Sequential Transition'
    }
  }
};

/**
 * Educational keyword and pattern matchers for query-to-model mapping.
 */
interface ModelMatcher {
  type: VisualModelType;
  keywords: string[];
  regex: RegExp;
}

const MODEL_MATCHERS: ModelMatcher[] = [
  {
    type: 'cpu-architecture',
    keywords: ['cpu', 'processor', 'fetch decode execute', 'alu', 'control unit', 'von neumann', 'registers', 'data bus', 'address bus', 'instruction cycle'],
    regex: /\b(cpu|processor|von neumann|alu|control unit|fetch[- ]decode[- ]execute|registers?|system bus)\b/i
  },
  {
    type: 'photosynthesis',
    keywords: ['photosynthesis', 'chloroplast', 'chlorophyll', 'calvin cycle', 'thylakoid', 'light reaction', 'rubisco', 'stroma'],
    regex: /\b(photosynthesis|chloroplast|chlorophyll|calvin cycle|thylakoid|rubisco)\b/i
  },
  {
    type: 'water-cycle',
    keywords: ['water cycle', 'hydrological cycle', 'evaporation', 'condensation', 'precipitation', 'transpiration', 'runoff'],
    regex: /\b(water cycle|hydrological cycle|evaporation|condensation|precipitation|transpiration)\b/i
  },
  {
    type: 'human-heart',
    keywords: ['human heart', 'heart', 'cardiovascular', 'atrium', 'ventricle', 'aorta', 'pulmonary artery', 'blood circulation', 'blood flow', 'cardiac cycle'],
    regex: /\b(heart|cardiovascular|cardiac|atrium|ventricle|aorta|pulmonary (artery|vein)|blood (flow|circulation))\b/i
  },
  {
    type: 'solar-system',
    keywords: ['solar system', 'planets', 'heliocentric', 'planetary orbit', 'mercury venus earth', 'jupiter saturn', 'celestial orbit'],
    regex: /\b(solar system|planets?|heliocentric|planetary orbit|sun and planets|jupiter|saturn)\b/i
  },
  {
    type: 'neural-network',
    keywords: ['neural network', 'neural networks', 'deep learning', 'perceptron', 'perceptrons', 'forward propagation', 'activation function', 'relu', 'hidden layers', 'weights and biases'],
    regex: /\b(neural networks?|perceptrons?|forward propagation|hidden layers?|deep learning|activation function)\b/i
  },
  {
    type: 'electric-circuit',
    keywords: ['electric circuit', 'dc circuit', "ohm's law", 'resistor', 'battery circuit', 'voltage current', 'closed circuit', 'electron flow'],
    regex: /\b(electric circuits?|dc circuit|ohm'?s law|resistors?|current flow|closed circuit|voltage and current)\b/i
  },
  {
    type: 'binary-search',
    keywords: ['binary search', 'divide and conquer', 'log n', 'low high mid', 'sorted array search', 'bsearch'],
    regex: /\b(binary search|log n|low high mid|divide and conquer)\b/i
  },
  {
    type: 'js-promise-flow',
    keywords: ['promise', 'promises', 'event loop', 'microtask', 'macrotask', 'async await', 'call stack', 'javascript promises', 'task queue'],
    regex: /\b(promises?|event loop|microtask|macrotask|call stack|javascript concurrency)\b/i
  },
  {
    type: 'sql-join-venn',
    keywords: ['sql join', 'inner join', 'left join', 'right join', 'outer join', 'database join', 'sql joins', 'relational join'],
    regex: /\b(sql joins?|inner join|left join|right join|full outer join|table joins?)\b/i
  },
  {
    type: 'os-scheduling',
    keywords: ['cpu scheduling', 'round robin', 'scheduling algorithm', 'ready queue', 'gantt chart', 'context switch', 'fcfs', 'time quantum'],
    regex: /\b(cpu scheduling|round robin|scheduling algorithm|ready queue|gantt chart|context switch|time quantum)\b/i
  },
  {
    type: 'pythagorean-theorem',
    keywords: ['pythagorean', 'pythagoras', 'hypotenuse', 'a^2 + b^2', 'a2 + b2', 'right angled triangle', 'pythagorean theorem'],
    regex: /\b(pythagorean|pythagoras|hypotenuse|a\^?2\s*\+\s*b\^?2|right[- ]angled triangle)\b/i
  }
];

/**
 * Determines appropriate VisualizationType categorization.
 */
export function getVisualType(type: VisualModelType | string): VisualizationType {
  switch (type) {
    case 'solar-system':
      return '3d';
    case 'cpu-architecture':
    case 'photosynthesis':
    case 'os-scheduling':
    case 'generic-process-flow':
      return 'process';
    case 'neural-network':
    case 'binary-search':
    case 'electric-circuit':
      return 'simulation';
    case 'js-promise-flow':
    case 'sql-join-venn':
    case 'water-cycle':
    case 'human-heart':
    case 'pythagorean-theorem':
    default:
      return 'diagram';
  }
}

/**
 * Converts EducationalVisualModel into structured TutorVisualSpec.
 */
export function buildTutorVisualSpec(model: EducationalVisualModel): TutorVisualSpec {
  const visualType = getVisualType(model.type);
  return {
    id: `spec-${model.id}`,
    type: model.type,
    visualType,
    visualTitle: model.title,
    visualDescription: model.caption || model.summary,
    model,
    parameters: model.interactiveParams
  };
}

/**
 * Questions that should explicitly NOT have a visual model attached
 * (conversational greetings, simple grammar checks, non-visual advice).
 */
const NON_VISUAL_PATTERNS = [
  /^(hi|hello|hey|good morning|good evening|who are you|what can you do|help me|thanks|thank you)\b/i,
  /\b(grammar|spelling|thank you note|cover letter|casual chat|joke|riddle)\b/i,
  /\b(what is your name|who made you|are you ai|mission|purpose|your purpose|main mission|your role)\b/i,
  /\b(interview tips|career advice|resume tips|study habits)\b/i
];

/**
 * Analyzes incoming query and optional AI answer text to detect whether
 * an animated educational visual model is relevant.
 * Returns the matching EducationalVisualModel or null if no visual is warranted.
 */
export function detectVisualModel(query: string, _answerText?: string): EducationalVisualModel | null {
  if (!query || typeof query !== 'string') return null;

  const cleanQuery = query.trim().toLowerCase();

  // Strict check for non-visual intent
  for (const pattern of NON_VISUAL_PATTERNS) {
    if (pattern.test(cleanQuery)) {
      return null;
    }
  }

  // Check specific matched models against user's question
  for (const matcher of MODEL_MATCHERS) {
    // 1. Direct query regex match (highest confidence)
    if (matcher.regex.test(cleanQuery)) {
      return VISUAL_MODELS_CATALOG[matcher.type];
    }

    // 2. Query contains trigger keywords
    if (matcher.keywords.some((kw) => cleanQuery.includes(kw))) {
      return VISUAL_MODELS_CATALOG[matcher.type];
    }
  }

  // Generic sequential educational process match if user explicitly asks about a lifecycle or multi-stage pipeline
  const processMatch = /\b(lifecycle|step[- ]by[- ]step process|pipeline stages|execution flow)\b/i.test(cleanQuery);
  if (processMatch) {
    return VISUAL_MODELS_CATALOG['generic-process-flow'];
  }

  return null;
}
