import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// 23 thematic blocks
const BLOCKS = [
  { label: 'Block 1 — Foundations',             labelRu: 'Блок 1 — Основы',                    dir: '01-foundations',          range: [1, 24]   },
  { label: 'Block 2 — Trading Strategies',       labelRu: 'Блок 2 — Торговые стратегии',         dir: '02-trading-strategies',   range: [25, 38]  },
  { label: 'Block 3 — Attention & Transformers', labelRu: 'Блок 3 — Трансформеры',               dir: '03-transformers',         range: [39, 58]  },
  { label: 'Block 4 — Large Language Models',    labelRu: 'Блок 4 — Языковые модели',             dir: '04-llm',                  range: [59, 78]  },
  { label: 'Block 5 — NLP & Pretraining',        labelRu: 'Блок 5 — NLP и предобучение',          dir: '05-nlp-bert',             range: [79, 101] },
  { label: 'Block 6 — Meta-Learning',            labelRu: 'Блок 6 — Мета-обучение',               dir: '06-meta-learning',        range: [102, 111]},
  { label: 'Block 7 — Transfer Learning',        labelRu: 'Блок 7 — Трансферное обучение',        dir: '07-transfer-learning',    range: [112, 116]},
  { label: 'Block 8 — Causal Inference',         labelRu: 'Блок 8 — Причинный вывод',             dir: '08-causal-inference',     range: [117, 131]},
  { label: 'Block 9 — Explainability',           labelRu: 'Блок 9 — Интерпретируемость',          dir: '09-explainability',       range: [132, 146]},
  { label: 'Block 10 — State Space Models',      labelRu: 'Блок 10 — Модели пространства',        dir: '10-ssm-mamba',            range: [147, 161]},
  { label: 'Block 11 — Physics-Informed NNs',    labelRu: 'Блок 11 — Физические НС',              dir: '11-physics-nn',           range: [162, 176]},
  { label: 'Block 12 — Generative Models',       labelRu: 'Блок 12 — Генеративные модели',        dir: '12-generative',           range: [177, 196]},
  { label: 'Block 13 — Contrastive & SSL',       labelRu: 'Блок 13 — Контрастное обучение',       dir: '13-contrastive-ssl',      range: [197, 218]},
  { label: 'Block 14 — Microstructure & LOB',    labelRu: 'Блок 14 — Микроструктура рынка',       dir: '14-microstructure-lob',   range: [219, 238]},
  { label: 'Block 15 — Reinforcement Learning',  labelRu: 'Блок 15 — Обучение с подкреплением',   dir: '15-reinforcement-learning',range: [239, 268]},
  { label: 'Block 16 — Uncertainty & Bayesian',  labelRu: 'Блок 16 — Неопределённость',           dir: '16-uncertainty-bayesian', range: [269, 279]},
  { label: 'Block 17 — Graph Neural Networks',   labelRu: 'Блок 17 — Графовые НС',               dir: '17-graph-nn',             range: [280, 290]},
  { label: 'Block 18 — CNN Time Series',         labelRu: 'Блок 18 — CNN для временных рядов',    dir: '18-cnn-timeseries',       range: [291, 300]},
  { label: 'Block 19 — Federated Learning',      labelRu: 'Блок 19 — Федеративное обучение',      dir: '19-federated-learning',   range: [301, 315]},
  { label: 'Block 20 — Quantum Computing',       labelRu: 'Блок 20 — Квантовые вычисления',       dir: '20-quantum-computing',    range: [316, 330]},
  { label: 'Block 21 — Model Efficiency',        labelRu: 'Блок 21 — Эффективность моделей',      dir: '21-model-efficiency',     range: [331, 350]},
  { label: 'Block 22 — Adversarial Robustness',  labelRu: 'Блок 22 — Устойчивость к атакам',      dir: '22-adversarial',          range: [351, 360]},
  { label: 'Block 23 — Frontier Methods',        labelRu: 'Блок 23 — Передовые методы',           dir: '23-frontier',             range: [361, 365]},
];

function makeSidebar(locale) {
  return BLOCKS.map(block => ({
    label: locale === 'ru' ? block.labelRu : block.label,
    autogenerate: { directory: `${locale}/chapters/${block.dir}` },
    collapsed: true,
  }));
}

export default defineConfig({
  integrations: [
    starlight({
      title: 'The Algotrading Book',
      description: 'Machine Learning for Crypto Markets — 365 chapters',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
        replacesTitle: false,
      },
      social: {
        github: 'https://github.com/suenot/the-algotrading-book',
      },
      defaultLocale: 'en',
      locales: {
        en: {
          label: 'English',
          lang: 'en',
        },
        ru: {
          label: 'Русский',
          lang: 'ru',
        },
      },
      sidebar: [
        {
          label: 'Overview',
          translations: { ru: 'Введение' },
          items: [
            { label: 'About the Book', link: '/en/', translations: { ru: 'О книге' } },
          ],
        },
        ...makeSidebar('en'),
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
