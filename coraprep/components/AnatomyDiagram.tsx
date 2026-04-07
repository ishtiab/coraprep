import React, { useMemo } from 'react'

type DiagramKey = 'brain-lobes' | 'brain-sagittal' | 'neuron' | 'eye' | 'ear' | 'nervous' | 'endocrine'

type DiagramConfig = {
  key: DiagramKey
  focus?: string
  title: string
  subtitle?: string
}

type Attribution = {
  title: string
  author: string
  licenseName: string
  licenseUrl: string
  sourceName: string
  sourceUrl: string
  notes?: string
}

function norm(s: string) {
  return String(s || '')
    .toLowerCase()
    .trim()
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
}

function getDiagramConfig(termRaw: string, categoryRaw?: string): DiagramConfig {
  const term = norm(termRaw)
  const category = norm(categoryRaw || '')

  const isVision = category.includes('vision') || /\b(retina|fovea|optic|cones|rods|lens|cornea|iris|aqueous|vitreous)\b/.test(term)
  if (isVision) {
    const focus =
      term.includes('optic chiasm') ? 'optic chiasm' :
      term.includes('optic nerve') ? 'optic nerve' :
      term.includes('fovea') ? 'fovea' :
      term.includes('cones') ? 'cones' :
      term.includes('rods') ? 'rods' :
      term.includes('retina') ? 'retina' :
      undefined

    return { key: 'eye', focus, title: 'Eye', subtitle: 'Openly-licensed labeled diagram' }
  }

  const isHearing = category.includes('hearing') || category.includes('sensory') || /\b(cochlea|auditory|hair cells|ear|ossicles|stapes|incus|malleus)\b/.test(term)
  if (isHearing) {
    const focus =
      term.includes('cochlea') ? 'cochlea' :
      term.includes('hair cells') ? 'hair cells' :
      term.includes('auditory nerve') ? 'auditory nerve' :
      undefined

    return { key: 'ear', focus, title: 'Ear', subtitle: 'Openly-licensed labeled diagram' }
  }

  const isNeuron =
    category.includes('neuron') ||
    category.includes('neurons') ||
    category.includes('glia') ||
    /\b(neuron|axon|dendrite|cell body|soma|nodes of ranvier|myelin|axon terminal|astrocyte|growth cone)\b/.test(term)

  if (isNeuron) {
    const focus =
      term.includes('dendrite') ? 'dendrites' :
      term.includes('cell body') || term.includes('soma') ? 'cell body (soma)' :
      term.includes('axon terminal') ? 'axon terminals' :
      term.includes('axon') ? 'axon' :
      term.includes('nodes of ranvier') ? 'nodes of ranvier' :
      term.includes('astrocyte') ? 'astrocyte (glia)' :
      term.includes('growth cone') ? 'growth cone' :
      undefined

    return { key: 'neuron', focus, title: 'Neuron', subtitle: 'Openly-licensed labeled diagram' }
  }

  const isEndocrine =
    category.includes('endocrine') ||
    category.includes('hormone') ||
    /\b(endocrine|hormone|pituitary|hypothalamus|thyroid|parathyroid|adrenal|pancreas|ovary|ovaries|testis|testes|pineal)\b/.test(term)

  if (isEndocrine) {
    const focus =
      term.includes('hypothalamus') ? 'hypothalamus' :
      term.includes('pituitary') ? 'pituitary' :
      term.includes('thyroid') ? 'thyroid' :
      term.includes('adrenal') ? 'adrenal glands' :
      term.includes('pancreas') ? 'pancreas' :
      undefined

    return { key: 'endocrine', focus, title: 'Endocrine System', subtitle: 'Openly-licensed labeled diagram' }
  }

  const isNervous =
    category.includes('nervous system') ||
    /\b(central nervous system|cns|brain and spinal cord|spinal cord|cranial nerves|autonomic|vagus)\b/.test(term)

  if (isNervous) {
    const focus =
      term.includes('spinal cord') ? 'spinal cord' :
      term.includes('central nervous system') || term.includes('cns') ? 'central nervous system' :
      term.includes('cranial nerves') ? 'cranial nerves' :
      term.includes('vagus') ? 'vagus nerve' :
      term.includes('autonomic') ? 'autonomic nervous system' :
      undefined

    return { key: 'nervous', focus, title: 'Central Nervous System', subtitle: 'Openly-licensed labeled diagram' }
  }

  const focus =
    term.includes('frontal lobe') ? 'frontal lobe' :
    term.includes('parietal') ? 'parietal lobe' :
    term.includes('temporal') ? 'temporal lobe' :
    term.includes('occipital') ? 'occipital lobe' :
    term.includes('cerebellum') ? 'cerebellum' :
    term.includes('brainstem') ? 'brainstem' :
    term.includes('corpus callosum') ? 'corpus callosum' :
    term.includes('thalamus') ? 'thalamus' :
    term.includes('hypothalamus') ? 'hypothalamus' :
    term.includes('hippocampus') ? 'hippocampus' :
    term.includes('amygdala') ? 'amygdala' :
    term.includes('broca') ? "broca's area" :
    term.includes('wernicke') ? "wernicke's area" :
    undefined

  // Use sagittal view for deeper structures, otherwise lobes.
  const deep = ['thalamus', 'hypothalamus', 'hippocampus', 'amygdala', 'corpus callosum'].some((t) => (focus || '').includes(t))
  return {
    key: deep ? 'brain-sagittal' : 'brain-lobes',
    focus,
    title: deep ? 'Brain (mid-sagittal)' : 'Brain (lateral)',
    subtitle: 'Openly-licensed labeled diagram',
  }
}

const DIAGRAMS: Record<DiagramKey, { file: string; attribution: Attribution }> = {
  'brain-lobes': {
    file: '/medical-svgs/brain_lobes_gray728.svg',
    attribution: {
      title: 'Gray728 — Principal fissures and lobes of the cerebrum (lateral view)',
      author: "Henry Vandyke Carter (Gray's Anatomy); vectorized by Mysid",
      licenseName: 'Public domain',
      licenseUrl: 'https://en.wikipedia.org/wiki/Public_domain',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Gray728.svg',
    },
  },
  'brain-sagittal': {
    file: '/medical-svgs/brain_sagittal_dbcls_202102.svg',
    attribution: {
      title: '202102 Mid-sagittal plane of the brain',
      author: 'DataBase Center for Life Science (DBCLS)',
      licenseName: 'CC BY 4.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:202102_Mid-sagittal_plane_of_the_brain.svg',
    },
  },
  neuron: {
    file: '/medical-svgs/neuron_complete_ladyofhats.svg',
    attribution: {
      title: 'Complete neuron cell diagram',
      author: 'LadyofHats',
      licenseName: 'Public domain',
      licenseUrl: 'https://en.wikipedia.org/wiki/Public_domain',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Complete_neuron_cell_diagram_en.svg',
    },
  },
  eye: {
    file: '/medical-svgs/eye_internal_chambers.svg',
    attribution: {
      title: 'Three internal chambers of the eye',
      author: 'Holly Fischer (original); Pixelsquid (vector)',
      licenseName: 'CC BY 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by/3.0/',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Three_Internal_chambers_of_the_Eye.svg',
    },
  },
  ear: {
    file: '/medical-svgs/ear_anatomy.svg',
    attribution: {
      title: 'Anatomy of the human ear',
      author: 'Lars Chittka; Axel Brockmann',
      licenseName: 'CC BY 2.5',
      licenseUrl: 'https://creativecommons.org/licenses/by/2.5/',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Anatomy_of_the_Human_Ear.svg',
    },
  },
  nervous: {
    file: '/medical-svgs/central_nervous_system.svg',
    attribution: {
      title: 'Central nervous system',
      author: 'Grm wnr',
      licenseName: 'Public domain',
      licenseUrl: 'https://en.wikipedia.org/wiki/Public_domain',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Central_nervous_system.svg',
      notes: 'Based on a public domain US government source (per file description).',
    },
  },
  endocrine: {
    file: '/medical-svgs/endocrine_system.svg',
    attribution: {
      title: 'Endocrine system',
      author: 'Termininja',
      licenseName: 'CC BY-SA 3.0',
      licenseUrl: 'https://creativecommons.org/licenses/by-sa/3.0/',
      sourceName: 'Wikimedia Commons',
      sourceUrl: 'https://commons.wikimedia.org/wiki/File:Endocrine_system.svg',
    },
  },
}

function AttributionBlock({ attribution }: { attribution: Attribution }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] text-slate-600">
        Illustration:{' '}
        <a
          href={attribution.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-slate-700 hover:underline"
        >
          {attribution.title}
        </a>{' '}
        — {attribution.author}.{' '}
        <a
          href={attribution.licenseUrl}
          target="_blank"
          rel="noreferrer"
          className="font-semibold text-slate-700 hover:underline"
        >
          {attribution.licenseName}
        </a>
        . Source: {attribution.sourceName}.
      </p>
      {attribution.notes ? <p className="text-[11px] text-slate-500">Note: {attribution.notes}</p> : null}
    </div>
  )
}

export default function AnatomyDiagram({
  term,
  category,
  imagePath,
}: {
  term: string
  category?: string
  imagePath?: string
}) {
  const config = useMemo(() => getDiagramConfig(term, category), [term, category])

  // If a custom imagePath is provided (e.g., future uploaded diagrams), prefer it.
  if (imagePath) {
    return (
      <div className="space-y-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Diagram</h3>
          <p className="text-xs text-slate-500">Custom diagram</p>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imagePath}
          alt={`${term} diagram`}
          className="w-full rounded-xl border border-slate-200 bg-white"
        />
      </div>
    )
  }

  const diagram = DIAGRAMS[config.key]

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900">{config.title}</h3>
          {config.subtitle ? <p className="text-xs text-slate-500">{config.subtitle}</p> : null}
        </div>
        {config.focus ? (
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-1 rounded">
            Related: {config.focus}
          </span>
        ) : null}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={diagram.file}
            alt={`${term} — ${config.title} diagram`}
            className="w-full h-auto"
            loading="lazy"
          />
        </div>
      </div>

      <AttributionBlock attribution={diagram.attribution} />
    </div>
  )
}
