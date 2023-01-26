import { MyLink } from '../../../components/MyLink'
import { notUndefined } from '../../../lib/utils'
import * as types from '../DeputeFiche.types'

export function ContactBlock({ depute }: { depute: types.Depute }) {
  //https://stackoverflow.com/questions/33577448/is-there-a-way-to-do-array-join-in-react
  function joinWithCommas(arr: JSX.Element[]): JSX.Element {
    return arr.reduce<JSX.Element>((acc, x, idx) => {
      if (idx === 0) return x
      return (
        <>
          {acc}, {x}
        </>
      )
    }, <></>)
  }

  const {
    emails,
    twitter,
    facebook,
    instagram,
    linkedin,
    sites_internet,
    adresses_postales,
  } = depute.adresses
  // see marietta-karamanli for an example with multiple emails
  return (
    <div className="my-4 bg-slate-200 px-8 py-4 shadow-md">
      <h2 className="font-bold">Contact</h2>
      <div className="py-4">
        <ul className="list-none">
          {emails.length > 0 && (
            <li>
              Email :{' '}
              {joinWithCommas(
                emails.map(s => (
                  <MyLink key={s} targetBlank href={`mailto:${s}`}>
                    {s}
                  </MyLink>
                )),
              )}
            </li>
          )}
          {twitter.length > 0 && (
            <li>
              Twitter{' '}
              {joinWithCommas(
                twitter.map(s => (
                  <MyLink key={s} href={`https://twitter.com/${s}`} targetBlank>
                    @{s}
                  </MyLink>
                )),
              )}
            </li>
          )}
          {facebook.length > 0 && (
            <li>
              Facebook{' '}
              {joinWithCommas(
                facebook.map(s => {
                  const shortUrl = `facebook.com/${s}`
                  const url = `https://www.facebook.com/${s}`
                  return (
                    <MyLink key={s} href={url} targetBlank>
                      {shortUrl}
                    </MyLink>
                  )
                }),
              )}
            </li>
          )}
          {instagram.length > 0 && (
            <li>
              Instagram{' '}
              {joinWithCommas(
                instagram.map(s => {
                  const shortUrl = `instagram.com/${s}`
                  const url = `https://www.instagram.com/${s}`
                  return (
                    <MyLink key={s} href={url} targetBlank>
                      {shortUrl}
                    </MyLink>
                  )
                }),
              )}
            </li>
          )}
          {linkedin.length > 0 && (
            <li>
              Linkedin{' '}
              {joinWithCommas(
                linkedin.map(s => {
                  const shortUrl = `linkedin.com${s}`
                  const url = `https://www.linkedin.com${s}`
                  return (
                    <MyLink key={s} href={url} targetBlank>
                      {shortUrl}
                    </MyLink>
                  )
                }),
              )}
            </li>
          )}
          {sites_internet.length > 0 && (
            <li>
              Site internet{' '}
              {joinWithCommas(
                sites_internet.map(s => {
                  const shortUrl = `linkedin.com${s}`
                  const url = `https://www.linkedin.com${s}`
                  return (
                    <MyLink key={s} href={url} targetBlank>
                      {shortUrl}
                    </MyLink>
                  )
                }),
              )}
            </li>
          )}
          {adresses_postales.map(value => {
            const {
              uid,
              typeLibelle,
              intitule,
              numeroRue,
              nomRue,
              complementAdresse,
              codePostal,
              ville,
            } = value

            return (
              <li key={'postales-' + uid} className="my-2">
                <p className="font-bold">{typeLibelle}:</p>
                <div className="">
                  {intitule ? <p>{intitule}</p> : null}
                  {numeroRue || nomRue ? (
                    <p>{[numeroRue, nomRue].filter(notUndefined).join(' ')}</p>
                  ) : null}
                  {complementAdresse ? <p>{complementAdresse}</p> : null}
                  {codePostal || ville ? (
                    <p>{[codePostal, ville].filter(notUndefined).join(' ')}</p>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>

        {(depute.collaborateurs.length && (
          <ul className="list-none">
            <b>Collaborateurs :</b>
            <br />
            {depute.collaborateurs.map(collaborateur => (
              <li key={collaborateur.full_name}>{collaborateur.full_name}</li>
            ))}
          </ul>
        )) ||
          null}
      </div>
    </div>
  )
}
