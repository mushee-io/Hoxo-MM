import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Database, RefreshCw, ShieldAlert } from 'lucide-react'
import {
  formatAtomicAssetBalance, hexTokenId, isTokenCatalogue, parseVerifiedPublicTokenLookup, type TokenCatalogue,
  type PublicPrivacyToken, TOKEN_PAGE_LIMIT,
} from '../lib/testnetCatalogue'
import { addPublicWatchlistId, readPublicWatchlist, removePublicWatchlistId } from '../lib/publicAssetWatchlist'

export type CataloguePurpose = 'swap' | 'lend' | 'portfolio' | 'launch'
export function TestnetAssetCatalogue({ purpose }: { purpose: CataloguePurpose }) {
  const [offset, setOffset] = useState(0)
  const [revision, setRevision] = useState(0)
  const [catalogue, setCatalogue] = useState<TokenCatalogue | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [tokenId, setTokenId] = useState('')
  const [found, setFound] = useState<PublicPrivacyToken | null>(null)
  const [lookupError, setLookupError] = useState('')
  const [checkingToken, setCheckingToken] = useState(false)
  const [tracked, setTracked] = useState<string[]>(() => readPublicWatchlist(localStorage))
  async function verifyPublicAssetId(requested?: string) {
    setLookupError('')
    setFound(null)
    const id = (requested ?? tokenId).trim()
    if (!hexTokenId(id)) { setLookupError('Paste the full 64-character hexadecimal Privacy Token ID from your Beldex testnet wallet.'); return }
    setCheckingToken(true)
    try {
      const response = await fetch('/api/testnet-token?id=' + id, { cache: 'no-store' })
      if (!response.ok) throw new Error('The testnet LWS did not return a confirmed public descriptor for that ID.')
      const result: unknown = await response.json()
      const verified = parseVerifiedPublicTokenLookup(result, id)
      if (!verified) throw new Error('Public asset metadata did not match the verified testnet descriptor')
      setFound(verified)
    } catch (cause) { setLookupError(cause instanceof Error ? cause.message : 'Public token lookup failed') }
    finally { setCheckingToken(false) }
  }

  function addTracked(id: string) {
    try { setTracked(addPublicWatchlistId(localStorage, id)); setLookupError('') }
    catch (cause) { setLookupError(cause instanceof Error ? cause.message : 'Could not save public token ID') }
  }
  function removeTracked(id: string) {
    try { setTracked(removePublicWatchlistId(localStorage, id)); setLookupError('') }
    catch (cause) { setLookupError(cause instanceof Error ? cause.message : 'Could not remove public token ID') }
  }

  const refresh = useCallback(() => setRevision(v => v + 1), [])
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    setLoading(true)
    setCatalogue(null)
    fetch('/api/testnet-tokens?offset=' + offset, { signal: controller.signal, cache: 'no-store' })
      .then(async response => {
        if (!response.ok) throw new Error('The public Beldex testnet token registry is unavailable (HTTP ' + response.status + ').')
        const result: unknown = await response.json()
        if (!isTokenCatalogue(result)) throw new Error('Beldex token-registry reply is not in a recognised format.')
        return result
      })
      .then(result => { if (!controller.signal.aborted) setCatalogue(result) })
      .catch(cause => { if (!controller.signal.aborted) setError(cause instanceof Error ? cause.message : 'Could not retrieve token registry') })
      .finally(() => { if (!controller.signal.aborted) setLoading(false) })
    return () => controller.abort()
  }, [offset, revision])
  const heading = purpose === 'swap' ? 'Beldex testnet public Privacy Token catalogue'
    : purpose === 'lend' ? 'Beldex testnet collateral asset discovery'
    : purpose === 'portfolio' ? 'Public Beldex testnet asset catalogue'
    : 'Network asset registry status'
  return <section className="panel">
    <div className="card-heading"><h3><Database size={17}/> {heading}</h3><span className="subtle-pill">PUBLIC TESTNET LWS · READ ONLY</span></div>
    <p className="muted smaller">This section retrieves asset IDs and public descriptions using the official wallet's configured Beldex testnet light-wallet endpoint. It does not request your wallet's private view key, holdings or balances.</p>
    {loading && <p className="muted smaller">Checking published token registry…</p>}
    {error && <div className="wallet-error"><ShieldAlert size={16}/><span>{error} HOXO will not invent tokens or market liquidity.</span><button className="mini-btn" onClick={refresh}>Retry</button></div>}
    {catalogue && <>
      <div className="route-result-metrics">
        <span>Returned public assets<b>{catalogue.tokens.length}</b></span>
        <span>Registry count<b>{catalogue.totalCount ?? 'Unreported'}</b></span>
        <span>Source read time<b>{new Date(catalogue.obtainedAt).toLocaleTimeString()}</b></span>
      </div>
      {catalogue.tokens.length ? <div className="table-scroll"><table className="data-table"><thead><tr><th>Privacy Token</th><th>Public asset ID</th><th>Supply (public descriptor)</th></tr></thead><tbody>
        {catalogue.tokens.map(token => <tr key={token.tokenId}>
          <td><b>{token.ticker || 'Untitled'}</b><small style={{ display: 'block' }}>{token.name || 'No description'}</small></td>
          <td><code title={token.tokenId}>{token.tokenId.slice(0, 10)}…{token.tokenId.slice(-8)}</code></td>
          <td>{formatAtomicAssetBalance(token.currentSupplyAtomic, token.decimals)}</td>
        </tr>)}
      </tbody></table></div> : <p className="muted smaller">No validated token descriptors were returned for this page. This does not prove no Privacy Tokens exist on the network.</p>}
      <p className="muted smaller">{catalogue.warning}</p>
      <div style={{ display: 'flex', gap: 9, flexWrap: 'wrap' }}>
        <button className="btn btn-outline" onClick={() => setOffset(x => Math.max(0, x - TOKEN_PAGE_LIMIT))} disabled={offset === 0}>Previous public assets</button>
        <button className="btn btn-outline" onClick={() => setOffset(x => x + TOKEN_PAGE_LIMIT)} disabled={catalogue.tokens.length < TOKEN_PAGE_LIMIT || (catalogue.totalCount !== null && offset + TOKEN_PAGE_LIMIT >= catalogue.totalCount)}>Next public assets <ArrowRight size={14}/></button>
        <button className="btn btn-outline" onClick={refresh}><RefreshCw size={14}/> Refresh registry</button>
      </div>
    </>}
    <div className="route-result" style={{ marginTop: 18 }}>
      <div className="card-heading"><h3>Look up a token created in your Beldex wallet</h3><span className="subtle-pill">NO KEYS REQUIRED</span></div>
      <p className="muted smaller">The official extension has a Tokens → Register token workflow. After registering on Beldex testnet, copy the token ID from the extension and check its public descriptor here. The browser app does not create the token or read your private token balance.</p>
      <label className="route-field">Full Privacy Token ID (64 hex characters)
        <input type="text" value={tokenId} maxLength={64} spellCheck={false} autoComplete="off" placeholder="Paste 64-character token identifier" onChange={e => setTokenId(e.target.value)}/>
      </label>
      <button className="btn btn-outline" style={{ marginTop: 10 }} disabled={checkingToken} onClick={() => void verifyPublicAssetId()}>
        {checkingToken ? 'Checking official testnet metadata…' : 'Verify testnet token ID'}
      </button>
      {lookupError && <p className="negative-text smaller">{lookupError}</p>}
      {found && purpose === 'portfolio' && <button className="btn btn-outline" style={{ marginTop: 12 }} disabled={tracked.includes(found.tokenId)} onClick={() => addTracked(found.tokenId)}>{tracked.includes(found.tokenId) ? 'Public token bookmarked' : 'Bookmark public token metadata (not a holding)'}</button>}
      {found && <div className="route-result-metrics">
        <span>Asset on public registry<b>{found.name || found.ticker || 'Unnamed'}</b></span>
        <span>Token ID<b style={{ overflowWrap: 'anywhere' }}>{found.tokenId.slice(0, 14)}…</b></span>
        <span>Descriptor supply<b>{formatAtomicAssetBalance(found.currentSupplyAtomic, found.decimals)}</b></span>
      </div>}
    </div>
    {purpose === 'portfolio' && <div className="route-result">
      <div className="card-heading"><h3>Saved public token identifiers</h3><span className="subtle-pill">WATCHLIST · NOT OWNED</span></div>
      <p className="muted smaller">These are public asset metadata bookmarks stored in this browser only. No token balance or ownership was queried. Beldex wallet extension dApps do not yet expose Privacy Token balance queries.</p>
      {tracked.length === 0 ? <p className="muted smaller">No public token IDs bookmarked. Verify an asset ID above to save it here.</p> :
        tracked.map(id => <div className="route-result-title" key={id} style={{ gap: 8, flexWrap: 'wrap' }}>
          <code title={id}>{id.slice(0, 14)}…{id.slice(-8)}</code>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="mini-btn" onClick={() => { setTokenId(id); void verifyPublicAssetId(id) }}>Check public metadata</button>
            <button className="mini-btn" onClick={() => removeTracked(id)}>Remove</button>
          </div>
        </div>)}
    </div>}
    {purpose === 'launch' && <div className="route-result">
      <b>Token-launch workflow on the official testnet wallet</b>
      <p className="muted smaller">1. Connect and unlock your Beldex Extension Wallet on TESTNET. 2. Open the extension's Tokens screen and select Register token. 3. Complete the wallet's issuance details and approve in the extension. 4. Copy the resulting asset ID and verify its public metadata above. 5. Confirm issuance in the wallet before claiming success. HOXO does not perform issuance or asset transfers on your behalf.</p>
    </div>}
    <div className="privacy-box" style={{ marginTop: 15 }}><ShieldAlert size={17}/><div><b>{purpose === 'portfolio' ? 'This is not your personal token inventory' : 'Discovery is not executable finance'}</b><p>{purpose === 'swap'
      ? 'Public token IDs can be discovered, but the wallet SDK does not offer dApps asset-specific send operations or atomic swap settlement. No real exchange is enabled.'
      : purpose === 'lend'
        ? 'Finding public testnet tokens does not allow HOXO to lock collateral, pay interest or automatically liquidate loans. Lending remains a local demonstration.'
        : purpose === 'portfolio'
          ? 'The only real wallet balance shown in HOXO Portfolio is BDX. Token ownership requires wallet-authorised token-balance APIs that are not yet exposed to third-party dApps.'
          : 'A registry response confirms that a public metadata endpoint replied; it is not evidence of successful private token transactions, working DeFi, or protocol deployment.'}</p></div></div>
  </section>
}
