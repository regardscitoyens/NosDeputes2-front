import { buildSeanceSummary } from './seanceSummary'

const sections = [
  {
    titre:
      'accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle',
    titre_complet:
      'accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle',
    id: 498,
    parent_id: 498,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle > procédure d'examen simplifiée",
    id: 499,
    parent_id: 498,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle > procédure d'examen simplifiée",
    id: 499,
    parent_id: 498,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle > procédure d'examen simplifiée",
    id: 499,
    parent_id: 498,
    nb_interventions: 0,
  },
  {
    titre:
      'régime de réélection des juges consulaires dans les tribunaux de commerce',
    titre_complet:
      'régime de réélection des juges consulaires dans les tribunaux de commerce',
    id: 500,
    parent_id: 500,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "régime de réélection des juges consulaires dans les tribunaux de commerce > procédure d'examen simplifiée",
    id: 501,
    parent_id: 500,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "régime de réélection des juges consulaires dans les tribunaux de commerce > procédure d'examen simplifiée",
    id: 501,
    parent_id: 500,
    nb_interventions: 0,
  },
  {
    titre: "procédure d'examen simplifiée",
    titre_complet:
      "régime de réélection des juges consulaires dans les tribunaux de commerce > procédure d'examen simplifiée",
    id: 501,
    parent_id: 500,
    nb_interventions: 0,
  },
  {
    titre: 'projet de loi de finances pour 2023',
    titre_complet: 'projet de loi de finances pour 2023',
    id: 496,
    parent_id: 496,
    nb_interventions: 2503,
  },
  {
    titre: 'première partie',
    titre_complet: 'projet de loi de finances pour 2023 > première partie',
    id: 497,
    parent_id: 496,
    nb_interventions: 298,
  },
  {
    titre: 'première partie',
    titre_complet: 'projet de loi de finances pour 2023 > première partie',
    id: 497,
    parent_id: 496,
    nb_interventions: 298,
  },
  {
    titre: "après l'article 3",
    titre_complet: "projet de loi de finances pour 2023 > après l'article 3",
    id: 495,
    parent_id: 496,
    nb_interventions: 1885,
  },
]

describe('seanceSummary', () => {
  it('should create a summary from sections', () => {
    expect(buildSeanceSummary(sections)).toEqual({
      sections: [
        {
          titre:
            'accord france-suisse relatif à la restructuration de la plateforme douanière de saint-louis – bâle',
          id: 498,
          subSections: [
            {
              titre: "procédure d'examen simplifiée",
              id: 499,
            },
          ],
        },
        {
          titre:
            'régime de réélection des juges consulaires dans les tribunaux de commerce',
          id: 500,
          subSections: [
            {
              titre: "procédure d'examen simplifiée",
              id: 501,
            },
          ],
        },
        {
          titre: 'projet de loi de finances pour 2023',
          id: 496,
          subSections: [
            {
              titre: 'première partie',
              id: 497,
            },
            {
              titre: "après l'article 3",
              id: 495,
            },
          ],
        },
      ],
    })
  })
})
