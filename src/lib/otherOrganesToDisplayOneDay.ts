export const tmp = ''

// tmp list of organes to see what we should display
// note : il faut distinguer entre les organes liés à une législature (bureau des presidents)
// et ceux qui ne le sont pas (trucs internationaux ou hors AN peut-être)

/*


Requête pour selectionner tous les organes actuellement et combien il y a de gens en tout pour ce type d'orgne

SELECT 
organes.data->>'codeType',  count(*) as cpt
FROM organes
INNER JOIN mandats ON organes.uid = ANY(mandats.organes_uids)
WHERE mandats.data->>'legislature' = '16'
AND mandats.data->>'dateFin' IS NULL
GROUP BY organes.data->>'codeType'
ORDER BY cpt desc, organes.data->>'codeType'
;


*/

/*


CONFPT - Conférence des présidents
=> tres important. 28 membres actuellement ?

il manque le Bureau ??


----NE PAS AFFICHER
ASSEMBLEE - Assemblée nationale
COMSENAT - Commissions sénatoriales
COMSPSENAT - Commissions spéciales sénatoriales
CONSTITU - Conseil constitutionnel
DELEGSENAT - Délégation sénatoriale
GOUVERNEMENT - Gouvernement
GP - Groupe politique
GROUPESENAT - Groupe sénatorial
MINISTERE - Ministère
PARPOL - Parti politique
PRESREP - Présidence de la République
SENAT - Sénat

-- AFFICHER
CMP - Commissions mixtes paritaires
CNPE - Commissions d’enquêtes
CNPS - Commissions spéciales
COMNL - Autres commissions permanentes
COMPER - Commissions permanentes législatives
DELEGBUREAU - Délégation du Bureau (de l’Assemblée Nationale)
DELEG - Délégation parlementaire
GE - Groupe d’études
GEVI - Groupe d’études à vocation internationale
MISINFOCOM - Missions d’information communes
MISINFOPRE - Missions d’information de la conférence des Présidents
OFFPAR - Office parlementaire ou délégation mixte


GA - Groupe d’amitié 
=> il y en a plein plein, plein de groupes et de membres ds chaque groupe => page dédiée
=> pas très prio pour moi

MISINFO - Missions d’informations
GE - Groupe d’études
=> il y en a pas mal
=> je pense faudra les afficher

API - Assemblée parlementaire internationale
=> pas sûr, peut-être un jour


-- PAS SUR, A CREUSER
ORGAINT - Organisme international
ORGEXTPARL - Organisme extra parlementaire => il y en a plein

HCJ - Haute Cour de justice
=> aucun membre actuellement, ça doit être un vieux truc

CJR - Cour de justice de la République
=> pareil aucun membre actuellement, c'est peut-être que quand elle est convoquée ?

*/
