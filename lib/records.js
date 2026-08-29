// The evidence register.
//
// One module, two consumers: the edge endpoint at api/dashboard.js and the
// renderer at scripts/render.mjs that writes the register into public/index.html
// so the page carries its own content and works without JavaScript.
//
// Every field below was written after opening the cited source on 29 August 2026
// and reading the passage it rests on. `misuse` is the field this register exists
// for: each record names the specific wrong inference it invites, because the
// characteristic failure in this subject area is not fabricating evidence, it is
// stretching real evidence past what it can carry.

export const RETRIEVED_ON = '2026-08-29';
export const NEXT_REVIEW = '2026-09-29';

export const CLASSES = {
  'Oversight Board decision': {
    weight: 'Adjudicated, binding on Meta as to the individual piece of content, and published with reasoning.',
    carries: 'What happened in that one case, what rule the Board found applicable, and what the Board asked Meta to change.',
    cannot: 'Prevalence. A decision is selected precisely because it is contested; the sample is not representative of anything, by construction.',
  },
  'Platform statement': {
    weight: 'The platform describing its own intentions in its own words.',
    carries: 'What the company has publicly committed to doing, which is a fact about the company that can be quoted back to it.',
    cannot: 'Any evidence about application. A published policy is the ceiling of what enforcement is supposed to be, never a measurement of what it was.',
  },
  'Coalition allegation': {
    weight: 'Advocacy. Signed, attributable, and asserting facts that no one outside the signatories has tested.',
    carries: 'That named organisations, on the record, say a thing is happening to them, and what remedies they are asking for.',
    cannot: 'The truth of the underlying incidents, their number, their cause, or any intent behind them.',
  },
  'Unverified citation': {
    weight: 'None. Retained as a visible failure rather than deleted.',
    carries: 'That this register once rested a claim on a source it can no longer produce.',
    cannot: 'Anything at all about the world.',
  },
};

export const RECORDS = [
  {
    id: 'ayahuasca-board',
    date: '2021-12-09',
    dateNote: 'Decision published 9 December 2021; the post at issue was made in July 2021.',
    title: 'Ayahuasca post removal overturned — case 2021-013-IG-UA',
    platform: 'Instagram',
    type: 'Oversight Board decision',
    status: 'Decision overturned',
    claim: 'Meta’s Oversight Board overturned Instagram’s removal of a post discussing the plant-based brew ayahuasca and required the content restored.',
    procedural: 'In July 2021 an Instagram account belonging to a spiritual school in Brazil posted an image of a dark brown liquid described in Portuguese as ayahuasca. Meta’s automated systems flagged the post for review because it had reached around 4,000 views and was trending; a human moderator then removed it. Meta told the Board it removed the post because the post encouraged the use of a non-medical drug, pointing to the user’s heart emoji, the word “medicine,” and the statement that it “can help you.”',
    establishes: 'A documented reversal in this individual case, and one structural finding with reach beyond it. The Board held that the post violated Facebook’s Regulated Goods Community Standard — which prohibited speaking positively about non-medical drug use — but did not violate Instagram’s Community Guidelines, which at the time covered only the sale and purchase of illegal or prescription drugs. In other words, the content was removed from Instagram under a rule that was not in Instagram’s published rules. The Board said it was concerned that Meta continues to apply Facebook’s Community Standards on Instagram without transparently telling users it is doing so, and noted that Meta did not tell this user which rule they had broken.',
    boundary: 'Does not establish a platform-wide pattern, a motive, or a legal violation. One post, one account, one moderator, one reversal.',
    misuse: 'The tempting inference is “Meta censors ayahuasca content.” What the record supports is narrower and more useful: on this occasion Instagram enforced an unpublished rule and told the user nothing about which rule it was. That is a transparency finding, not a suppression finding, and it is the finding that generalises — because the gap between the published guidelines and the applied standard was structural, not specific to this post.',
    recommendations: 'The Board recommended that Meta explain to users precisely which rule in the content policy they violated; modify Instagram’s Community Guidelines and Facebook’s Regulated Goods standard to permit positive discussion of traditional or religious uses of non-medical drugs where there is historic evidence of such use; and make public all allowances to these policies, including existing ones.',
    whatWouldChange: 'Board recommendations are non-binding and Meta must respond to them. Evidence that these three recommendations were or were not implemented — and whether the Instagram guidelines were in fact amended — would convert a single case into something about the system. This register does not currently hold that evidence.',
    sourceUrl: 'https://www.oversightboard.com/news/1780492362340442-oversight-board-overturns-meta-s-decision-case-2021-013-ig-ua/',
    verifiedOn: '2026-08-29',
  },
  {
    id: 'ketamine-board',
    date: '2023-08-17',
    title: 'Ketamine paid-partnership post ordered removed — case 2023-010-IG-MR',
    platform: 'Instagram',
    type: 'Oversight Board decision',
    status: 'Decision overturned',
    claim: 'The Board overturned Meta’s decision to leave up a paid-partnership post promoting ketamine treatment, required its removal, and found the post violated both the Branded Content policies and the Restricted Goods and Services Community Standard.',
    procedural: 'A verified Instagram user posted ten illustrated images on 29 December 2022 describing ketamine treatment for anxiety and depression at a named provider’s offices, with the provider tagged as co-author and the post labelled a paid partnership. The post reached roughly 85,000 views from an account with about 200,000 followers. Three users reported it; it was removed and restored three times under the Restricted Goods and Services Standard, the third removal executed by an automated system acting on previous moderator decisions. The creator’s status as a Meta “managed partner” — which comes with a dedicated partner manager — helped escalate the matter internally, and the post was restored roughly six months after it was published. Meta then referred the case to the Board itself.',
    establishes: 'A documented policy-enforcement reversal, and an admission about enforcement architecture that is more consequential than the outcome. In response to the Board’s questions Meta acknowledged that not all content carrying a paid-partnership label is reviewed against its Branded Content policies, that at-scale moderators cannot see the label, and that those moderators cannot reroute content to the specialised team that enforces those policies. The Board also noted that it learned of the paid nature of the post only after submitting questions — Meta had not described it in the referral. The Board found this greatly increases the risk of under-enforcement.',
    boundary: 'Does not quantify broader enforcement and does not establish discriminatory intent. The Board says the case “indicates” that restrictions on branded content promoting drugs “may be” inconsistently enforced — the hedges are the Board’s own, and they are load-bearing.',
    misuse: 'This decision is routinely cited as evidence that Meta suppresses psychedelic content. It is evidence of the opposite failure direction: a commercial post promoting a drug stayed up for six months and Meta initially defended leaving it up. The register keeps it because a suppression thesis that cannot accommodate its own counter-evidence is not an evidence base, it is a position. The transferable finding is that enforcement in this category is inconsistent in both directions, and that inconsistency has an identified mechanical cause — labels the reviewers cannot see and no route to the team that can act on them.',
    recommendations: 'The Board recommended that Meta clarify the meaning of the paid-partnership label; clarify in the Restricted Goods and Services Standard that content admitting to or promoting pharmaceutical drug use that may produce a “high” is allowed only in the context of a supervised medical setting; ensure paid-partnership content is routed to reviewers or systems able to apply the Branded Content policies; and audit enforcement of the drug-related policy lines, closing any gaps found.',
    whatWouldChange: 'The audit the Board asked for. If Meta published its results, this record would stop being an anecdote about one post and become a measurement — which is the single largest gap in this whole register.',
    sourceUrl: 'https://www.oversightboard.com/decision/ig-tom6ixvh/',
    verifiedOn: '2026-08-29',
  },
  {
    id: 'congress-letter',
    date: '2024-03-15',
    title: 'Reported congressional letter on illicit-drug advertising — source not verifiable',
    platform: 'Meta',
    type: 'Unverified citation',
    status: 'Source not verifiable',
    claim: 'This record previously stated that a bipartisan group of 19 members of Congress asked Meta to explain reports of illicit-drug advertisements and its related enforcement practices.',
    procedural: 'On 29 August 2026 the cited congressional press release returned HTTP 404. A Wayback Machine lookup returned no snapshot of the URL. The claim was therefore withdrawn rather than repeated.',
    establishes: 'Nothing. The source behind this record cannot be produced.',
    boundary: 'Retained so the failed citation stays visible rather than disappearing. Do not treat this entry as evidence that the letter exists, that it had 19 signatories, or that the underlying allegations occurred.',
    misuse: 'Two errors are available here and the register guards against both. The first is treating the entry as evidence — it is not, and no part of it should be repeated. The second is treating an unverifiable citation as a disproof: nothing here establishes that no such letter was ever sent, only that this register cannot produce the document it once cited. A deleted row would have concealed both facts.',
    note: 'Even had the source resolved, a congressional request for information is an inquiry, not an adjudication. It would have documented scrutiny, never a finding.',
    whatWouldChange: 'A retrievable primary document — the letter itself on a congressional domain, a Congressional Record entry, or an archived copy — would let this record be rewritten as evidence of scrutiny. Until then it stands as a record of a citation failure.',
    sourceUrl: null,
    sourceNote: 'Cited URL walberg.house.gov/media/press-releases/walberg-castor-lead-bipartisan-letter-meta-over-illicit-drug-advertisements returned HTTP 404 and has no Wayback Machine snapshot.',
    verifiedOn: '2026-08-29',
  },
  {
    id: 'meta-spam',
    date: '2025-04-24',
    title: 'Meta announced reach and monetisation penalties for spam tactics',
    platform: 'Facebook',
    type: 'Platform statement',
    status: 'Policy announcement',
    claim: 'Meta said accounts using tactics such as captions unrelated to the content, inordinate hashtag volume, or coordinated spam networks may have their content shown only to their own followers and lose monetisation eligibility.',
    procedural: 'A post on Meta’s own newsroom describing changes to Facebook Feed. Meta stated that in 2024 it removed more than 100 million fake Pages engaged in scripted follows abuse and over 23 million profiles impersonating large content producers, and that comments it detects as coordinated fake engagement will be seen less.',
    establishes: 'The platform’s disclosed enforcement approach for a specified set of spam behaviours, in its own words, on the record. Two features of the announcement matter for anyone reading it as context for drug-policy moderation. It is framed entirely around behaviour — caption relevance, hashtag volume, coordinated networks — and not around subject matter. And it is about Facebook Feed; the announcement does not extend itself to Instagram.',
    boundary: 'Does not document drug-policy suppression and does not prove how the policy was applied in any individual case. A policy announcement is the ceiling of intended enforcement, not a measurement of actual enforcement.',
    misuse: 'This is the record most often pressed into service as an explanation for reduced reach on advocacy accounts — either as the innocent cause or as the cover story. It can support neither. A behaviour-based distribution penalty and a topic-based one produce the same visible symptom for the account owner: fewer views, no notification, no appeal. That symptom cannot distinguish between them from outside, which is precisely why the coalition record below asks for an appeals process rather than asserting a mechanism.',
    whatWouldChange: 'Per-account distribution data, or a notice telling an affected account which policy reduced its reach. Meta discloses neither, and the absence is why this category of question stays unresolvable from public sources.',
    sourceUrl: 'https://about.fb.com/news/2025/04/cracking-down-spammy-content-facebook/',
    verifiedOn: '2026-08-29',
  },
  {
    id: 'ssdp-coalition',
    date: '2025-06-16',
    title: 'Coalition open letter alleging disproportionate moderation of drug-policy content',
    platform: 'Meta',
    type: 'Coalition allegation',
    status: 'Advocacy statement',
    claim: 'Students for Sensible Drug Policy and its cosigners allege that accounts doing public education, policy advocacy, research dissemination and harm-reduction work — including those of licensed healthcare professionals, nonprofits and legal businesses — have been routinely shadowbanned, deplatformed, or had posts removed with little explanation or recourse, despite operating in full compliance with local laws.',
    procedural: 'An open letter addressed to Meta’s leadership and content-moderation teams, published 16 June 2025. As of 29 August 2026 the page lists 81 cosigning organisations alongside SSDP, among them the Drug Policy Alliance, NORML, the Marijuana Policy Project and Harm Reduction International. The list is explicitly open — the page invites further organisations to join through a form — so the count is a reading on a date, not a fixed figure.',
    establishes: 'A coalition advocacy statement, its allegations, and the specific remedies being sought. The letter asks Meta for four things: an end to bans and shadowbans on accounts operating within legal guidelines; clear, transparent and consistent policies that distinguish promotion of the sale of illegal substances from legitimate drug education and advocacy; a dedicated appeals and accountability process for drug-related content that includes community stakeholders and subject-matter experts; and regular dialogue with the affected communities.',
    boundary: 'Does not independently verify any incident, quantify prevalence, identify a common cause, or establish discriminatory intent. The letter names no account, no date, and no removal; it reports the experience of its signatories.',
    misuse: 'The number of signatories is the figure that gets quoted, and it is the one that proves least. Eighty-two organisations agreeing that something happened to them is a strong statement about salience and a weak one about frequency — the letter is signed by exactly the population most likely to notice and least likely to be a random sample. Read for what it does carry, it is the clearest available statement of the remedy gap: three of its four asks are procedural, and a platform could grant all three without conceding any factual allegation.',
    whatWouldChange: 'Incident-level documentation — dated removals, account names, notice text, appeal outcomes — assembled by someone other than the affected parties. That is the evidence class this register has none of, from any source, and no amount of restating the allegation substitutes for it.',
    sourceUrl: 'https://ssdp.org/blog/stop-meta-censorship/',
    verifiedOn: '2026-08-29',
  },
];

export const READING_RULES = [
  {
    rule: 'A reversal is about one post.',
    body: 'Both Oversight Board decisions in this register were selected by the Board because they were hard. Cases reach the Board through appeal or referral, never through sampling, so the set of published decisions is systematically unrepresentative of ordinary enforcement. Any sentence beginning “the Board has found that Meta…” and ending in a prevalence claim is unsupported by the decisions themselves.',
  },
  {
    rule: 'A published policy is a ceiling, not a measurement.',
    body: 'Platform statements say what enforcement is meant to do. Nothing in this register measures what it did. The two Board decisions are the closest thing available to a look inside enforcement, and both found it inconsistent — in opposite directions.',
  },
  {
    rule: 'An allegation is evidence of an allegation.',
    body: 'A coalition letter establishes that named organisations assert something on the record and what they are asking for. It does not establish the underlying facts. This is not a comment on the signatories’ credibility; it is what an unexamined assertion can carry, whoever makes it.',
  },
  {
    rule: 'The symptom does not identify the cause.',
    body: 'Reduced reach with no notice looks identical whether it comes from a behaviour-based spam penalty, a topic-based restriction, a ranking change, or ordinary variance. Nothing published by any platform in this register lets an account owner tell those apart from the outside. Arguments that assume they can are the most common error in this subject area.',
  },
  {
    rule: 'A citation that cannot be produced is disclosed, not deleted.',
    body: 'One record in this register cites a source that returned 404 with no archived copy. It is kept, marked, and stripped of any evidentiary weight. Deleting it would hide both the original error and the fact that it was found.',
  },
];
