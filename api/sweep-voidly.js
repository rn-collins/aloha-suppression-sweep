// api/sweep-voidly.js
// Platform Suppression Register — Aloha AI Consulting
// 43 verified incidents + 3 systemic actions from exhaustive deep research
// Sources: TechCrunch, MJBizDaily, Westword, The Microdose, SSDP, AIVL,
//          Filter, Marijuana Moment, WeedWeek, Beauty Independent, GreenState,
//          Vaping360, Vejpkollen, In5D, psychedelicsasl.com, Daily Hive + more
//
// Cron: runs weekly (see vercel.json) + on GET to /api/sweep-voidly
// Storage: Upstash Redis — keys aloha:suppression:{id} + aloha:suppression:index

const VERIFIED_INCIDENTS = [
  // ── META / INSTAGRAM / FACEBOOK ──────────────────────────────────────────
  {
    id: "inc_001",
    title: "DoubleBlind Magazine — Instagram repeatedly suspended since 2021",
    org: "DoubleBlind Magazine",
    platform: "Instagram",
    sector: "Psychedelics / Media",
    heat: "hot",
    date: "2025-02-21",
    summary: "Legal California-registered psychedelic science and policy magazine suspended multiple times since 2021 citing 'regulated goods.' Shadowbanned prior to each suspension. Content is entirely educational. A former Meta employee confirmed arbitrary enforcement patterns to DoubleBlind.",
    evidence: "Meta guidelines explicitly permit 'debating or advocating for the legality or discussing scientific or medical merits of high risk drugs.' DoubleBlind operates within those guidelines. Account repeatedly reinstated without explanation, then re-suspended.",
    source: "DoubleBlind Mag / Mattha Busby",
    sourceUrl: "https://doubleblindmag.com/inside-instagrams-censorship-of-psychedelics/",
    tags: ["instagram", "psychedelics", "media", "shadowban", "suspension"]
  },
  {
    id: "inc_002",
    title: "Moms on Mushrooms — Instagram permanently banned twice in 2025",
    org: "Moms on Mushrooms",
    platform: "Instagram",
    sector: "Psychedelics / Advocacy",
    heat: "hot",
    date: "2025-05-27",
    summary: "Tracey Tee's Denver-based psilocybin education organization for mothers permanently banned twice in 2025 (first October 2024, second May 2025). 35,000+ followers lost. Meta told The Microdose the account was removed 'by mistake and have been restored' — but Tee reported it remained permanently banned. Forced to rebuild on YouTube from under 100 followers.",
    evidence: "Purely educational content. No sales coordination. No illegal content. Meta's own appeals process returned no specific violation. Pattern: second ban within months of first shows systematic targeting.",
    source: "Denver Westword / Brendan Joel Kelley",
    sourceUrl: "https://www.westword.com/marijuana/moms-on-mushrooms-shifts-to-youtube-after-instagram-ban-24648032",
    tags: ["instagram", "psychedelics", "advocacy", "permanent-ban", "psilocybin"]
  },
  {
    id: "inc_003",
    title: "UC Berkeley Center for the Science of Psychedelics — Instagram suspended",
    org: "UC Berkeley Center for the Science of Psychedelics",
    platform: "Instagram",
    sector: "Psychedelics / Academia",
    heat: "hot",
    date: "2025-05-28",
    summary: "UC Berkeley academic research institution conducting peer-reviewed psychedelic research had its Instagram account suspended May 28, 2025. Meta spokesperson Erin Logan told The Microdose the account was removed 'by mistake.' Part of the May 2025 wave affecting 58+ organizations.",
    evidence: "Academic institution with no commercial activity. No sales coordination. Meta's own spokesperson admitted it was a mistake — confirming the suppression was unjustified by Meta's own standards.",
    source: "The Microdose / jane c. hu",
    sourceUrl: "https://themicrodose.substack.com/p/meta-suspends-numerous-psychedelics",
    tags: ["instagram", "psychedelics", "academia", "suspension", "research"]
  },
  {
    id: "inc_004",
    title: "Psychedelic Assembly — Instagram permanently banned after reinstated",
    org: "Psychedelic Assembly",
    platform: "Instagram",
    sector: "Psychedelics / Community",
    heat: "hot",
    date: "2025-05-21",
    summary: "Kat Lakey's community organization connecting people interested in psychedelics suspended May 21, 2025; reinstated after three days; then permanently banned within hours of reinstatement. Second appeal yielded a permanent ban confirmation — then Meta later said it was among the accounts removed 'by mistake.'",
    evidence: "Operated within Meta's stated guidelines. Permanent ban followed a successful appeal. Meta's own eventual acknowledgment of 'mistake' confirms the ban was unjustified.",
    source: "The Microdose",
    sourceUrl: "https://themicrodose.substack.com/p/meta-suspends-numerous-psychedelics",
    tags: ["instagram", "psychedelics", "community", "permanent-ban"]
  },
  {
    id: "inc_005",
    title: "MAPS / Psychedelic Science conference — Instagram suspended one week",
    org: "MAPS / Psychedelic Science Conference",
    platform: "Instagram",
    sector: "Psychedelics / Research",
    heat: "warm",
    date: "2025-05-20",
    summary: "Flagship conference of MAPS (501(c)(3) conducting FDA-approved clinical research) had its Instagram account suspended approximately one week before being reinstated after appeal. Part of the May 2025 wave.",
    evidence: "FDA-approved nonprofit clinical research organization with no commercial drug sales. Reinstated without explanation, confirming no valid policy basis for the suspension.",
    source: "The Microdose",
    sourceUrl: "https://themicrodose.substack.com/p/meta-suspends-numerous-psychedelics",
    tags: ["instagram", "psychedelics", "research", "suspension", "MAPS"]
  },
  {
    id: "inc_006",
    title: "Plant Media Project (Gina Vensel) — Instagram jail + 58-organization data collection",
    org: "Plant Media Project",
    platform: "Instagram",
    sector: "Psychedelics / Marketing",
    heat: "hot",
    date: "2025-05-30",
    summary: "Gina Vensel, co-founder of Plant Media Project (psychedelics and wellness marketing agency), placed in 'Instagram jail' for 72 hours after posting a story about other accounts that had been removed. She then created a Google Form to collect reports — received 58 respondents, all reporting vague 'community guidelines' explanations with no specific violations cited.",
    evidence: "Punished for reporting on other bans — a clear chilling effect. 58 organizations affected in the same period with identical vague explanations.",
    source: "The Microdose",
    sourceUrl: "https://themicrodose.substack.com/p/meta-suspends-numerous-psychedelics",
    tags: ["instagram", "psychedelics", "media", "shadowban", "suspension", "coalition"]
  },
  {
    id: "inc_007",
    title: "Psychedelics As a Second Language (@psychedelicsasl) — AI ban mechanism documented",
    org: "Psychedelics As a Second Language",
    platform: "Instagram",
    sector: "Psychedelics / Education",
    heat: "hot",
    date: "2025-05-24",
    summary: "Suspended May 24, 2025 for 'guns, drugs, and other restricted goods.' Documented that the ban followed a 'Training Meta AI' promotional email two days earlier, suggesting an AI moderation rollout triggered the wave. Meta Korea acknowledged excessive AI enforcement to the organization on June 18, 2025.",
    evidence: "Temporal correlation between Meta AI training announcement (May 22) and suspension wave (May 21–28). Meta Korea's admission of 'excessive AI enforcement' is direct acknowledgment of algorithmic malfunction.",
    source: "psychedelicsasl.com",
    sourceUrl: "https://psychedelicsasl.com/faulty-meta-ai-bans-psychedelic-education-and-personal-accounts/",
    tags: ["instagram", "psychedelics", "education", "AI-moderation", "permanent-ban"]
  },
  {
    id: "inc_008",
    title: "May–June 2025 Meta ban wave — 58+ accounts, 100-organization coalition response",
    org: "Multiple organizations (58+ documented)",
    platform: "Instagram / Facebook",
    sector: "Psychedelics / Cannabis / Harm Reduction",
    heat: "hot",
    date: "2025-05-30",
    summary: "The largest documented single event: 58+ organizations suspended or banned in a coordinated wave. Included academic institutions, licensed practitioners, nonprofits, and legal businesses — all receiving identical vague 'community guidelines' explanations. Prompted SSDP to coordinate a global open letter signed by ~100 organizations.",
    evidence: "Coincided with a broader Instagram global ban wave (30,000+ signatures on petition, TechCrunch coverage June 16, 2025). Meta's own spokesperson admitted specific accounts were removed 'by mistake.' Yet many accounts remain permanently banned.",
    source: "SSDP / The Microdose / TechCrunch",
    sourceUrl: "https://ssdp.org/blog/stop-meta-censorship/",
    tags: ["instagram", "facebook", "psychedelics", "cannabis", "harm-reduction", "mass-suspension", "coalition"]
  },
  {
    id: "inc_009",
    title: "Alice Mushrooms — Instagram deleted four times in six weeks",
    org: "Alice Mushrooms",
    platform: "Instagram",
    sector: "Functional Mushrooms / Wellness",
    heat: "hot",
    date: "2025-06-01",
    summary: "Lindsay Goodstein/Cruze's functional mushroom chocolate brand (no psilocybin) had its Instagram account deleted approximately four times in six weeks beginning June 2025, flagged for 'guns, drugs, and other restricted goods.' Founder estimated hundreds of thousands of dollars in lost revenue due to account losses.",
    evidence: "Legal functional mushroom brand with no controlled substances. Flagged by automated moderation unable to distinguish between psilocybin mushrooms and legal functional mushrooms (lion's mane, reishi, etc.).",
    source: "Beauty Independent",
    sourceUrl: "https://www.beautyindependent.com/functional-mushroom-brands-say-meta-barring-accounts-instagram-shop/",
    tags: ["instagram", "functional-mushrooms", "wellness", "permanent-ban", "e-commerce"]
  },
  {
    id: "inc_010",
    title: "Mush More Co. / Mushie (Catherine Anise) — repeated e-commerce violations",
    org: "Mush More Co.",
    platform: "Instagram",
    sector: "Functional Mushrooms / Wellness",
    heat: "warm",
    date: "2025-06-01",
    summary: "Catherine Anise's functional mushroom brand received repeated 'e-commerce violations' from Instagram. Founder concluded: 'Meta was mining for mushrooms.' Legal functional mushroom products flagged identically to controlled substances.",
    evidence: "Legal consumer wellness products. Automated moderation cannot distinguish species — functional mushrooms (reishi, lion's mane) blocked alongside psilocybin-containing species.",
    source: "Beauty Independent",
    sourceUrl: "https://www.beautyindependent.com/functional-mushroom-brands-say-meta-barring-accounts-instagram-shop/",
    tags: ["instagram", "functional-mushrooms", "wellness", "e-commerce", "suppression"]
  },
  {
    id: "inc_011",
    title: "Micropause — menopause supplement brand blocked from Instagram Shop",
    org: "Micropause",
    platform: "Instagram",
    sector: "Health / Wellness",
    heat: "warm",
    date: "2025-06-01",
    summary: "Menopause supplement brand Micropause blocked from selling on Instagram Shop. Legal health supplement with no controlled substances. Part of a documented pattern of wellness brands being blocked from Instagram's commerce features.",
    evidence: "Legal supplement brand. No drug sales. Blocking from Instagram Shop eliminates a significant direct-to-consumer revenue channel with no policy basis.",
    source: "Beauty Independent",
    sourceUrl: "https://www.beautyindependent.com/functional-mushroom-brands-say-meta-barring-accounts-instagram-shop/",
    tags: ["instagram", "wellness", "supplements", "e-commerce", "suppression"]
  },
  {
    id: "inc_012",
    title: "Catalyst Cannabis (Elliot Lewis) — Instagram extortion lawsuit, $40k+ paid to Meta employees",
    org: "Catalyst Cannabis",
    platform: "Instagram",
    sector: "Cannabis / Dispensary",
    heat: "hot",
    date: "2026-05-12",
    summary: "Elliot Lewis, CEO of Catalyst Cannabis (one of California's largest dispensary chains, 30+ stores), alleges Instagram suspended his accounts multiple times since 2023 and that he was forced to pay $40,000+ to Meta employees to restore them. Filed lawsuit alleging a 'closed loop extortionate fraud scheme' where Meta employees accept bribes from competitors to suspend accounts.",
    evidence: "'I don't sue without receipts,' Lewis told WeedWeek. Licensed California cannabis business in full compliance with state law. If allegations are proven, represents systemic corruption inside Meta's moderation system.",
    source: "WeedWeek / Alex Halperin",
    sourceUrl: "https://weedweek.com/industry-news/scoop-instagram-extorted-cannabis-ceo-to-restore-account-lawsuit-claims/",
    tags: ["instagram", "cannabis", "dispensary", "lawsuit", "extortion", "california"]
  },
  {
    id: "inc_013",
    title: "December 2024 cannabis wave — CMS Gardens, Old Pal, Budist, Housing Works",
    org: "Multiple cannabis brands",
    platform: "Instagram / Facebook",
    sector: "Cannabis",
    heat: "hot",
    date: "2024-12-23",
    summary: "After Meta updated its terms and conditions, 'thousands of accounts that were related to cannabis started going down' (John Greene, CMS Gardens). Named victims: CMS Gardens (RI), Old Pal (CA, shadowbanned 'many times over the years'), Budist (CA, account deleted despite education-only content, restored after two days), Housing Works Cannabis Co. (NY, suspended under false premise of 'selling marijuana illegally'). All are state-licensed, state-regulated businesses.",
    evidence: "Housing Works is a licensed New York state retailer. Budist is a rating/review platform with no sales. Old Pal is a licensed brand. All suspended without differentiation from actual illegal vendors.",
    source: "MJBizDaily / Margaret Jackson",
    sourceUrl: "https://mjbizdaily.com/cannabis-operators-report-instagram-page-shadow-bans-closures/",
    tags: ["instagram", "facebook", "cannabis", "dispensary", "mass-ban", "shadowban"]
  },
  {
    id: "inc_014",
    title: "Service Disabled Veterans in Cannabis Association — Instagram suspended",
    org: "Service Disabled Veterans in Cannabis Association",
    platform: "Instagram",
    sector: "Cannabis / Veterans Advocacy",
    heat: "warm",
    date: "2024-11-21",
    summary: "Service Disabled Veterans in Cannabis Association account suspended November 21, 2024 without notice. Advocacy organization for disabled veterans in the cannabis industry. No commercial sales activity.",
    evidence: "Veterans advocacy organization with no sales coordination. Suspended without notice or specific violation cited.",
    source: "Heady NJ",
    sourceUrl: "https://headynj.com/politics/instagram-suspends-service-disabled-veterans-in-cannabis-association-account/",
    tags: ["instagram", "cannabis", "veterans", "advocacy", "suspension"]
  },
  {
    id: "inc_015",
    title: "Puffco — Instagram account deleted days before major product launch",
    org: "Puffco",
    platform: "Instagram",
    sector: "Cannabis Devices",
    heat: "warm",
    date: "2024-11-21",
    summary: "Puffco (leading dab device manufacturer, ~800,000 Instagram followers) had its account deleted October 2024, days before a major product launch. Restored Monday October 14, 2024. In late 2024 Puffco released a viral protest video asserting Instagram's enforcement stifles community building among veterans, medical patients, and legal consumers.",
    evidence: "Legal consumer electronics brand. Account restored — confirming no valid policy basis. Product launch timing of the deletion caused significant commercial damage.",
    source: "Marijuana Moment / Ben Adlin",
    sourceUrl: "https://www.marijuanamoment.net/marijuana-vape-company-slams-instagram-and-meta-for-blocking-cannabis-related-social-media-content/",
    tags: ["instagram", "cannabis", "devices", "deletion", "restored"]
  },
  {
    id: "inc_016",
    title: "Jade Stone (Katie Motta) — Instagram reach collapsed from collaborator tag",
    org: "Jade Stone",
    platform: "Instagram",
    sector: "Cannabis",
    heat: "warm",
    date: "2025-03-01",
    summary: "Katie Motta, founder of Jade Stone, was tagged as a collaborator on a reel from an event she attended. Within 24 hours the post was removed and her account was flagged for 'Community Standards on Cannabis.' Despite not creating the reel, her reach beyond existing followers dropped dramatically.",
    evidence: "Did not create the flagged content. Punished by association for being tagged in someone else's post. No sales coordination, no illegal content.",
    source: "GreenState",
    sourceUrl: "https://www.greenstate.com/business/cannabis-creators-meta/",
    tags: ["instagram", "cannabis", "shadowban", "reach-suppression", "collaborator-tag"]
  },
  {
    id: "inc_017",
    title: "Cannabis verified creator (50k followers) — disabled twice after Meta's policy relaxation announcement",
    org: "Cannabis creator (anonymous/verified)",
    platform: "Instagram",
    sector: "Cannabis / Content Creation",
    heat: "hot",
    date: "2025-07-01",
    summary: "A verified cannabis Instagram account with 50,000+ authentic followers was permanently disabled, rebuilt to near 50,000 followers again, then permanently disabled a second time — both bans occurring within weeks of Meta's public announcement that it would ease cannabis restrictions. Apparel and backup accounts also simultaneously disabled.",
    evidence: "Permanent bans issued directly after Meta publicly announced relaxing cannabis censorship — demonstrating disconnect between stated policy and enforcement. Coordinated disabling of all associated accounts suggests targeted action.",
    source: "GreenState",
    sourceUrl: "https://www.greenstate.com/business/cannabis-creators-meta/",
    tags: ["instagram", "cannabis", "permanent-ban", "verified-account", "policy-gap"]
  },
  {
    id: "inc_018",
    title: "@imcannabess (Bess Byers) — account deleted at 90k followers, launched #cannabisblackoutday",
    org: "@imcannabess / Bess Byers",
    platform: "Instagram",
    sector: "Cannabis / Content Creation",
    heat: "warm",
    date: "2025-01-01",
    summary: "Cannabis influencer Bess Byers had her account deleted at approximately 90,000 followers. In response she launched #cannabisblackoutday — a coordinated campaign to highlight Meta's discriminatory enforcement against cannabis content creators.",
    evidence: "Account with 90,000 organic followers deleted without warning. The launch of #cannabisblackoutday indicates the suppression is widespread enough to organize around.",
    source: "Daily Hive",
    sourceUrl: "https://dailyhive.com/grow/cannabis-influencer-instagram-account-deleted",
    tags: ["instagram", "cannabis", "influencer", "permanent-ban", "advocacy"]
  },
  {
    id: "inc_019",
    title: "The Lift Cannabis — Instagram account deleted days before Lift Cannabis Expo",
    org: "The Lift Cannabis",
    platform: "Instagram",
    sector: "Cannabis",
    heat: "warm",
    date: "2025-01-01",
    summary: "The Lift Cannabis had its Instagram account deactivated shortly before the Lift Cannabis Expo in Vancouver, losing 11,000 followers at the worst possible moment for an event-focused brand.",
    evidence: "Licensed cannabis brand. Timing of deletion (pre-event) caused maximum commercial and reputational damage. No sales coordination or illegal content.",
    source: "Brand Joint",
    sourceUrl: "https://mjbizdaily.com/cannabis-operators-report-instagram-page-shadow-bans-closures/",
    tags: ["instagram", "cannabis", "deletion", "event"]
  },
  {
    id: "inc_020",
    title: "California Bureau of Marijuana Control — Facebook shadowbanned state regulatory agency",
    org: "California Bureau of Marijuana Control",
    platform: "Facebook",
    sector: "Government / Cannabis Regulation",
    heat: "hot",
    date: "2018-01-01",
    summary: "Facebook shadowbanned the California Bureau of Marijuana Control — a state government regulatory agency — blocking it from search results. The agency responsible for regulating the legal cannabis market cannot effectively reach the public it regulates. Pattern established 2018, documented through present.",
    evidence: "A government agency with no commercial interest, tasked with public safety regulation, suppressed on a platform that simultaneously allowed actual illegal drug vendors to operate freely.",
    source: "Marijuana Moment / NCIA",
    sourceUrl: "https://www.marijuanamoment.net/marijuana-and-drug-groups-press-meta-about-shadowbanning-and-censorship-of-content-on-facebook-and-instagram/",
    tags: ["facebook", "cannabis", "government", "shadowban", "regulatory-agency"]
  },
  {
    id: "inc_021",
    title: "Cannabis influencers — industry-wide forced to use code words as bans escalate",
    org: "Cannabis content creator industry",
    platform: "Instagram / TikTok / Facebook",
    sector: "Cannabis / Content Creation",
    heat: "warm",
    date: "2026-05-13",
    summary: "Cannabis creators across all platforms systematically using code words (broccoli, lettuce, tree, 420 variants) to avoid suppression — survival strategy for an industry legal in 38 states. Multiple creators lost accounts with tens of thousands of followers overnight with no clear violation. Brands shifting marketing budgets away from social media entirely, investing in email lists and owned media.",
    evidence: "Legal industry in 38 states. Meta, TikTok, and others cite federal prohibition as justification despite operating in fully legal states. Medical cannabis information being flagged alongside recreational content.",
    source: "MunchNews",
    sourceUrl: "https://cannabisnews.munchmakers.com/article/cannabis-influencers-turn-to-code-words-as-platform-bans-escalate-mp3asrej",
    tags: ["instagram", "tiktok", "facebook", "cannabis", "shadowban", "code-words"]
  },
  {
    id: "inc_022",
    title: "Meta December 2024 policy update — thousands of cannabis accounts deactivated simultaneously",
    org: "Cannabis industry — multiple operators",
    platform: "Instagram / Facebook",
    sector: "Cannabis",
    heat: "hot",
    date: "2024-12-23",
    summary: "Meta's December 2024 terms update triggered simultaneous mass deactivation. New policy restricting cannabis content visibility to 18+ was implemented without differentiation — sweeping up educational, advocacy, and licensed business accounts. 'As soon as that email was sent to Meta users, thousands of accounts that were related to cannabis started going down.'",
    evidence: "Coordinated mass action affecting licensed businesses, educational accounts, and advocacy organizations simultaneously. No individualized review before deactivation.",
    source: "MJBizDaily",
    sourceUrl: "https://mjbizdaily.com/cannabis-operators-report-instagram-page-shadow-bans-closures/",
    tags: ["instagram", "facebook", "cannabis", "mass-ban", "policy-change"]
  },
  // ── RACIAL EQUITY — BLACK WOMEN IN PSYCHEDELIC ADVOCACY ───────────────────
  {
    id: "inc_023",
    title: "People of Color Psychedelic Collective (Ifetayo Harvey) — 10,000 followers shadowbanned",
    org: "People of Color Psychedelic Collective",
    platform: "Instagram",
    sector: "Psychedelics / Racial Equity",
    heat: "warm",
    date: "2021-01-01",
    summary: "Ifetayo Harvey's organization building community for people of color in psychedelic spaces had approximately 10,000 followers before being shadowbanned, with high engagement dropping dramatically. Part of a documented pattern of Black women in psychedelic advocacy being disproportionately targeted.",
    evidence: "Advocacy and community organization with no commercial activity. Part of a documented racial equity disparity in platform enforcement documented by Filter and The Microdose.",
    source: "Filter",
    sourceUrl: "https://filtermag.org/instagrams-black-women-psychedelics/",
    tags: ["instagram", "psychedelics", "racial-equity", "shadowban", "advocacy"]
  },
  {
    id: "inc_024",
    title: "Robin Divine — Instagram page deleted after racist troll mass-reporting",
    org: "Robin Divine",
    platform: "Instagram",
    sector: "Psychedelics / Racial Equity",
    heat: "hot",
    date: "2021-10-24",
    summary: "Robin Divine, Black women's psychedelic advocacy creator, had her Instagram page mass-reported by a racist troll operation on October 23, 2021 and deleted by Instagram on October 24, 2021. Posts about decolonization of psychedelic spaces were used as pretext. No response to appeals.",
    evidence: "Documented mass-reporting campaign by bad actors used Instagram's reporting mechanism as a harassment tool. Platform failed to distinguish coordinated trolling from legitimate policy violations.",
    source: "Filter / filtermag.org",
    sourceUrl: "https://filtermag.org/instagrams-black-women-psychedelics/",
    tags: ["instagram", "psychedelics", "racial-equity", "troll-reporting", "permanent-ban"]
  },
  {
    id: "inc_025",
    title: "Soma Phoenix (@Psillygirls) — 14,000 followers banned over psychedelics-and-race content",
    org: "Soma Phoenix / @Psillygirls",
    platform: "Instagram",
    sector: "Psychedelics / Racial Equity",
    heat: "hot",
    date: "2021-01-01",
    summary: "Soma Phoenix built ~14,000 followers over five years creating content at the intersection of psychedelics and race justice. Account permanently banned. Still banned as of last documented reporting. Part of the documented pattern of Black women in psychedelic advocacy facing disproportionate suppression.",
    evidence: "Five years of account-building erased. Still banned. Documented alongside Robin Divine and Ifetayo Harvey as part of a racial equity disparity pattern in Instagram's enforcement.",
    source: "Filter / The Microdose",
    sourceUrl: "https://filtermag.org/instagrams-black-women-psychedelics/",
    tags: ["instagram", "psychedelics", "racial-equity", "permanent-ban"]
  },
  {
    id: "inc_026",
    title: "Sesh Safety (Dan Owns) — Facebook harm reduction group, 50,000+ members deleted 2018",
    org: "Sesh Safety",
    platform: "Facebook",
    sector: "Harm Reduction",
    heat: "hot",
    date: "2018-01-01",
    summary: "Dan Owns' Facebook harm reduction group with 50,000+ members was deleted in 2018. Facebook declined to comment. Group provided life-saving drug safety information to a large community. One of the earliest documented cases of harm reduction content suppression at scale.",
    evidence: "50,000+ member community providing evidence-based harm reduction deleted without explanation. Facebook's silence on the deletion demonstrates absence of appeals pathway.",
    source: "TalkingDrugs",
    sourceUrl: "https://www.talkingdrugs.org/why-are-social-media-giants-censoring-life-saving-information/",
    tags: ["facebook", "harm-reduction", "community", "deletion"]
  },
  // ── PSYCHEDELIC MEDIA — PATTERN OF SUPPRESSION ───────────────────────────
  {
    id: "inc_027",
    title: "Mycopreneur (Dennis Walker) — permanently disabled same week won Wonderland 'Media Company of Year'",
    org: "Mycopreneur",
    platform: "Instagram",
    sector: "Psychedelics / Media",
    heat: "hot",
    date: "2025-06-01",
    summary: "Dennis Walker's Mycopreneur — a leading psychedelic media and education brand with ~25,000 followers — had its Instagram account permanently disabled after appeal. Timing: the same week Mycopreneur won 'Media Company of the Year' at the Wonderland Awards. Appeal process failed to restore the account.",
    evidence: "Award-winning media company with industry recognition. Permanently banned the same week of peak visibility. Appeal failed — account remains gone.",
    source: "Dennis Walker / Lucid News",
    sourceUrl: "https://psychedelicsuncensored.beehiiv.com/p/instagram-banned-this-post",
    tags: ["instagram", "psychedelics", "media", "permanent-ban", "appeal-failed"]
  },
  {
    id: "inc_028",
    title: "Psychedelics Today — suspended in May 2025 wave",
    org: "Psychedelics Today",
    platform: "Instagram",
    sector: "Psychedelics / Media",
    heat: "warm",
    date: "2025-05-01",
    summary: "Psychedelics Today — one of the most established psychedelic media outlets — suspended during the May 2025 Meta ban wave. Part of the documented pattern affecting DoubleBlind, Lucid News, Mycopreneur, and others.",
    evidence: "Established media organization. Part of the May 2025 wave. Consistent with the documented pattern of all major psychedelic media outlets facing repeated enforcement.",
    source: "Psychedelics Uncensored",
    sourceUrl: "https://psychedelicsuncensored.beehiiv.com/p/instagram-banned-this-post",
    tags: ["instagram", "psychedelics", "media", "suspension"]
  },
  {
    id: "inc_029",
    title: "Third Wave — suspended in May 2025 wave",
    org: "Third Wave",
    platform: "Instagram",
    sector: "Psychedelics / Education",
    heat: "warm",
    date: "2025-05-01",
    summary: "Third Wave — psychedelic education platform focused on responsible use — suspended during the May 2025 Meta ban wave affecting the broader psychedelic media ecosystem.",
    evidence: "Education platform focused on responsible, informed psychedelic use — exactly the type of harm reduction content Meta guidelines are supposed to protect.",
    source: "Psychedelics Uncensored",
    sourceUrl: "https://psychedelicsuncensored.beehiiv.com/p/instagram-banned-this-post",
    tags: ["instagram", "psychedelics", "education", "suspension"]
  },
  {
    id: "inc_030",
    title: "Tripsitter / DoubleBlind / Lucid News / Mycopreneur — multi-platform suppression pattern",
    org: "Multiple psychedelic media organizations",
    platform: "Instagram / Google / Twitter / Substack",
    sector: "Psychedelics / Media",
    heat: "warm",
    date: "2025-06-03",
    summary: "Tripsitter documented a cross-platform suppression pattern: Google delisted most psychedelic content in early 2023 algorithm updates; Twitter/X shadowbanned Tripsitter for sharing Substack links; Instagram throttled engagement for educational content; while faceless accounts openly selling illegal substances persisted on all platforms untouched.",
    evidence: "Educational harm reduction content suppressed while actual illegal drug sales continue unmoderated. The suppression systematically targets educators and advocates while ignoring the exact content the policies are meant to stop.",
    source: "Tripsitter",
    sourceUrl: "https://tripsitter.substack.com/p/psychedelic-censorship",
    tags: ["instagram", "twitter", "google", "psychedelics", "media", "shadowban", "cross-platform"]
  },
  // ── YOUTUBE ───────────────────────────────────────────────────────────────
  {
    id: "inc_031",
    title: "GreenMedInfo / Sayer Ji — YouTube channels removed 4 years, government coordination confirmed",
    org: "GreenMedInfo / Sayer Ji",
    platform: "YouTube / Instagram / Facebook / LinkedIn / Pinterest",
    sector: "Health / Wellness",
    heat: "hot",
    date: "2021-03-28",
    summary: "Both GreenMedInfo and Sayer Ji's personal YouTube channels permanently removed March 28, 2021 — reinstated October 2025 after YouTube confirmed content 'does not violate our Community Guidelines.' In Congressional testimony, Alphabet admitted the Biden Administration pressured platforms to remove content. YouTube's reinstatement served as evidence in Ji's litigation. $1M+ invested in alternative platform Unite.Live — shut down due to continued suppression.",
    evidence: "YouTube's October 2025 reinstatement is direct admission that the removal was unjustified. Congressional testimony confirmed government pressure. Note: GreenMedInfo's underlying content is disputed and characterized by mainstream outlets as health misinformation — record as 'contested-content suppression.'",
    source: "Sayer Ji / Substack",
    sourceUrl: "https://sayerji.substack.com/p/vindicated-youtube-restores-my-channels",
    tags: ["youtube", "health", "wellness", "government-pressure", "deplatforming", "reinstated"]
  },
  {
    id: "inc_032",
    title: "GrimmGreen (Nick Green) — YouTube shuts down 16-year vaping harm reduction channel",
    org: "GrimmGreen / Nick Green",
    platform: "YouTube",
    sector: "Harm Reduction / Vaping",
    heat: "hot",
    date: "2025-12-19",
    summary: "Nick Green's GrimmGreen channel — started in 2009, 410,000+ subscribers, 101M+ views, 16 years of vaping and tobacco harm reduction content — terminated December 12, 2025. Patreon simultaneously deactivated, eliminating all monthly income. Channel restored in late December 2025 amid broader YouTube AI enforcement reversal wave.",
    evidence: "'I have never promoted anything illegal. I have never targeted young people.' Annual YouTube enforcement 'raids' tied to political pressure. First video taken down was about a government-funded Parkinson's/nicotine patch study — not drug promotion.",
    source: "Vejpkollen.se / GFN.tv",
    sourceUrl: "https://www.vejpkollen.se/en/2025/12/youtube-stanger-ner-grimmgreen-16-ar-av-vejphistoria-raderas/",
    tags: ["youtube", "harm-reduction", "vaping", "deplatforming", "reinstated"]
  },
  {
    id: "inc_033",
    title: "Ruby Roo — YouTube vaping creator, 85,000+ followers, forced to delete top videos",
    org: "Ruby Roo",
    platform: "YouTube",
    sector: "Harm Reduction / Vaping",
    heat: "warm",
    date: "2024-01-01",
    summary: "Vaping creator Ruby Roo with 85,000+ followers was forced to delete videos including her most-viewed ever under YouTube's vaping enforcement. Channel significantly restricted under post-2016 FDA tobacco policies that demonetize all vaping content regardless of educational value.",
    evidence: "Content deleted was not illegal promotion — was forced deletion to avoid further enforcement. Harm reduction creators bear the cost of policies aimed at commercial product promotion.",
    source: "Vaping360",
    sourceUrl: "https://vaping360.com/vape-news/66360/youtube-vaping-channels/",
    tags: ["youtube", "harm-reduction", "vaping", "demonetization", "content-deletion"]
  },
  {
    id: "inc_034",
    title: "In5D.com — YouTube/Facebook systematic suppression 2021–2026, live streams hidden",
    org: "In5D.com",
    platform: "YouTube / Facebook",
    sector: "Wellness / Consciousness",
    heat: "warm",
    date: "2026-04-18",
    summary: "17-year-old platform documented: 98% collapse in YouTube views (2012: 15.1M → 2024: 225k), 99% collapse in Facebook referrals (2015: 4.3M → 2019: 25k). YouTube subscribers declining yearly since 2021 despite growing channel. April 2026: two of three live streams hidden from public despite YouTube Studio showing 'Excellent signal.' View counts on YouTube's own support documentation videos erased between April 17–19, 2026.",
    evidence: "YouTube's own support documentation videos had view counts drop to 0 during the period. 148,000 YouTube followers receiving 0 organic views on live streams. Data documented with screenshots and timestamps.",
    source: "In5D",
    sourceUrl: "https://in5d.com/17-years-of-big-tech-suppression-the-data-they-cant-deny/",
    tags: ["youtube", "facebook", "wellness", "shadowban", "algorithmic-suppression"]
  },
  {
    id: "inc_035",
    title: "YouTube — systemic health and wellness demonetization, January 2026 reversal acknowledges over-breadth",
    org: "Wellness creator community",
    platform: "YouTube",
    sector: "Health / Wellness",
    heat: "warm",
    date: "2026-01-13",
    summary: "YouTube's January 2026 monetization update explicitly reversed years of over-broad demonetization of mental health, self-harm awareness, suicide prevention, and health education content. YouTube's own statement acknowledged guidelines 'had become too restrictive and ended up demonetizing uploads.' Mental health, yoga, and health coaching channels had been systematically stripped of ad revenue on content that was 'helpful, no misinformation, nothing controversial.'",
    evidence: "YouTube's January 2026 statement is a direct institutional admission of years of unjustified suppression. Channels can now appeal prior demonetization decisions under the new framework.",
    source: "TechCrunch / YouTube Creator Insider",
    sourceUrl: "https://outlierkit.com/resources/youtube-relaxes-monetization-controversial-content-2026/",
    tags: ["youtube", "wellness", "mental-health", "demonetization", "health-education", "policy-reversal"]
  },
  // ── TIKTOK ────────────────────────────────────────────────────────────────
  {
    id: "inc_036",
    title: "Pill Testing Australia, CanTEST, KnowYourStuffNZ — TikTok/Meta ban life-saving overdose alerts",
    org: "Pill Testing Australia / CanTEST / KnowYourStuffNZ / AIVL",
    platform: "Instagram / Facebook / TikTok",
    sector: "Harm Reduction",
    heat: "hot",
    date: "2026-04-01",
    summary: "Multiple harm reduction organizations had overdose prevention alerts removed, accounts suspended, and pages permanently deleted. A Pill Testing Australia warning about strong MDMA and nitazenes (potent synthetic opioid) circulating at a Canberra music festival was removed three days before the event — after appeals were rejected. The alerts are also read by medical teams and emergency departments to prepare for drug-related presentations.",
    evidence: "AIVL CEO John Gobeil: 'Meta is silencing health workers who are simply trying to stop people from overdosing.' KnowYourStuffNZ banned for warning about a dangerous synthetic sold as MDMA. All appeals rejected. AIVL formally called on Australia's eSafety Commissioner to compel restoration.",
    source: "AIVL",
    sourceUrl: "https://aivl.org.au/pill-testing-groups-silenced/",
    tags: ["instagram", "facebook", "tiktok", "harm-reduction", "overdose-prevention", "public-health"]
  },
  {
    id: "inc_037",
    title: "TikTok — mass removal of wellness content, biohacking, supplement recommendations (May 2026)",
    org: "TikTok wellness creator community",
    platform: "TikTok",
    sector: "Wellness",
    heat: "hot",
    date: "2026-05-13",
    summary: "May 13, 2026: TikTok announced removal of content related to unproven wellness trends, immediately removing thousands of videos. Categories targeted: biohacking, supplement recommendations, alternative health practices. Creators received vague violation notices with no specific guidance. TikTok also maintains zero tolerance on cannabis (including coded language like 'lettuce,' '420'), banning educational cannabis content alongside recreational.",
    evidence: "Millions of wellness creators affected. Policy sweeps educational content that 'lacks scientific backing' — a standard that is enforced by automated systems unable to distinguish peer-reviewed discussion from pseudoscience.",
    source: "The Tech Edvocate",
    sourceUrl: "https://www.thetechedvocate.org/the-alarming-impact-of-tiktoks-new-content-moderation-policy-on-wellness-trends/",
    tags: ["tiktok", "wellness", "biohacking", "supplements", "mass-removal", "cannabis"]
  },
  // ── GOOGLE SEARCH / SEO ───────────────────────────────────────────────────
  {
    id: "inc_038",
    title: "Psychedelic media — Google 2023 Helpful Content Update buries educational sites",
    org: "Psychedelic media (Tripsitter, DoubleBlind, others)",
    platform: "Google Search",
    sector: "Psychedelics / Media",
    heat: "warm",
    date: "2023-09-14",
    summary: "The September 2023 Google Helpful Content Update (rolled out Sept. 14–28, 2023) buried psychedelic and harm reduction educational content in search results. DoubleBlind and 'every other psychedelic media site we know' lost significant search traffic. Harm reduction articles ranked #1 for years were pushed below addiction treatment ads. DoubleBlind cited this as a contributing factor in its late-2024 pivot to newsletter-first.",
    evidence: "DoubleBlind documentation of traffic losses. Pattern consistent across multiple psychedelic and alternative health publishers. Addiction treatment sites (commercial) gained rankings while independent educational publishers lost them.",
    source: "Tripsitter / DoubleBlind",
    sourceUrl: "https://tripsitter.substack.com/p/psychedelic-censorship",
    tags: ["google", "search", "psychedelics", "media", "algorithmic-suppression", "seo"]
  },
  {
    id: "inc_039",
    title: "GreenMedInfo — Google Search 81% visibility drop (2018)",
    org: "GreenMedInfo",
    platform: "Google Search",
    sector: "Health / Wellness",
    heat: "warm",
    date: "2018-07-01",
    summary: "GreenMedInfo documented an 81% drop in Google Search visibility between April 15 and August 15, 2018 during a Google algorithm change that hit alternative health sites. Mercola experienced 84%+ decline; others 90%+. Mayo Clinic and WebMD gained rankings in the same period. Note: GreenMedInfo's underlying content is disputed as health misinformation by mainstream outlets — record as contested-content suppression.",
    evidence: "Documented with traffic analytics. Correlated with Google algorithm update. Pattern affected multiple alternative health publishers simultaneously while mainstream health properties gained.",
    source: "GreenMedInfo / Sayer Ji",
    sourceUrl: "https://greenmedinfo.com/blog/self-interested-whims-oligarchs-google-and-facebook-kill-access-alternative-and-i",
    tags: ["google", "search", "health", "algorithmic-suppression", "contested-content"]
  },
  {
    id: "inc_040",
    title: "Drugsand.me (Ivan Eromano) — Google algorithm traffic collapse",
    org: "Drugsand.me",
    platform: "Google Search",
    sector: "Harm Reduction",
    heat: "warm",
    date: "2023-01-01",
    summary: "Drugsand.me, a harm reduction website providing objective drug information, experienced significant Google Search traffic collapse following algorithm updates. Founder Ivan Eromano documented the impact. Part of the broader pattern affecting harm reduction and drug information publishers.",
    evidence: "Harm reduction educational content ranked below commercial treatment sites and sensationalist content. Algorithm updates consistently disadvantage independent harm reduction publishers.",
    source: "TalkingDrugs",
    sourceUrl: "https://www.talkingdrugs.org/why-are-social-media-giants-censoring-life-saving-information/",
    tags: ["google", "search", "harm-reduction", "algorithmic-suppression"]
  },
  {
    id: "inc_041",
    title: "Twitter/X SAMHSA partnership — cannabis search warning excluded alcohol and tobacco (2020)",
    org: "Twitter / SAMHSA",
    platform: "Twitter / X",
    sector: "Cannabis",
    heat: "warm",
    date: "2020-01-01",
    summary: "Twitter partnered with SAMHSA (Substance Abuse and Mental Health Services Administration) to display health warnings when users searched for 'marijuana' — but explicitly excluded similar searches for alcohol and tobacco, which cause far more documented deaths annually. Suspended by Elon Musk after acquisition in late 2022.",
    evidence: "Selective application of health warnings — cannabis flagged, alcohol and tobacco excluded — demonstrates political rather than public health basis for the enforcement. Policy suspended 2022 under new ownership.",
    source: "Marijuana Moment",
    sourceUrl: "https://www.marijuanamoment.net/marijuana-vape-company-slams-instagram-and-meta-for-blocking-cannabis-related-social-media-content/",
    tags: ["twitter", "cannabis", "government-partnership", "selective-enforcement"]
  },
  {
    id: "inc_042",
    title: "John Lennon 'Lucy in the Sky' Facebook explainer — 500k views then deleted",
    org: "Psychedelics Uncensored",
    platform: "Facebook",
    sector: "Psychedelics / Education",
    heat: "warm",
    date: "2024-01-01",
    summary: "A Facebook educational explainer about John Lennon's song 'Lucy in the Sky with Diamonds' reached 500,000 views and was then deleted by Facebook citing 'Violation of Community Standards on drugs.' An educational post about a 1967 Beatles song triggered automated drug content moderation.",
    evidence: "500,000 organic views before deletion — demonstrates this content serves genuine public interest. Deletion demonstrates automated moderation operating without contextual understanding of educational vs. promotional content.",
    source: "Psychedelics Uncensored",
    sourceUrl: "https://psychedelicsuncensored.beehiiv.com/p/instagram-banned-this-post",
    tags: ["facebook", "psychedelics", "education", "deletion", "automated-moderation"]
  },
  // ── SYSTEMIC / GOVERNMENT ─────────────────────────────────────────────────
  {
    id: "sys_001",
    title: "Federal grand jury probe — Meta subpoenaed re: drug content on platforms (2023)",
    org: "U.S. Department of Justice (EDVA) / FDA",
    platform: "Meta platforms",
    sector: "Systemic / Government",
    heat: "hot",
    date: "2023-01-01",
    summary: "A U.S. federal criminal grand jury probe (prosecutors with FDA assistance, reported as Eastern District of Virginia) sent Meta subpoenas in 2023 seeking records on 'violative drug content on Meta's platforms and/or the illicit sale of drugs.' Reported by WSJ March 16, 2024. The probe focused on actual illegal drug sales but created institutional pressure that preceded indiscriminate enforcement sweeps.",
    evidence: "Tech Transparency Project found 450+ ads on Instagram and Facebook selling pharmaceutical and other drugs in Meta's own Ad Library while educators were being banned — demonstrating the probe targeted the wrong actors.",
    source: "WSJ via CNBC / Tech Transparency Project",
    sourceUrl: "https://www.cnbc.com/2024/03/15/meta-received-subpoenas-from-federal-prosecutors-regarding-drug-trafficking-on-its-platforms.html",
    tags: ["government", "DOJ", "meta", "subpoena", "structural"]
  },
  {
    id: "sys_002",
    title: "Bipartisan Congressional letter to Zuckerberg — 19 members pressure Meta on drug ads (August 2024)",
    org: "U.S. House Energy & Commerce Committee (19 members)",
    platform: "Meta platforms",
    sector: "Systemic / Government",
    heat: "hot",
    date: "2024-08-15",
    summary: "A bipartisan group of 19 House members (led by Reps. Walberg, Bilirakis, Castor, Trahan) sent a letter to Zuckerberg August 15, 2024 demanding action on illicit drug ads, citing 22 minors per week dying from drug overdoses. This government pressure to crack down on actual drug sellers immediately preceded the indiscriminate December 2024 enforcement sweeps that caught thousands of legal businesses and educators.",
    evidence: "Temporal correlation: Congressional letter August 2024 → Meta policy update December 2024 → thousands of legal cannabis and psychedelic educational accounts simultaneously deleted. Government pressure aimed at illegal drug sellers produced collateral suppression of legal operators.",
    source: "walberg.house.gov / Tech Transparency Project",
    sourceUrl: "https://walberg.house.gov/media/press-releases/walberg-bilirakis-castor-and-trahan-led-bipartisan-letter-calls-meta-crack-down",
    tags: ["government", "congress", "meta", "cannabis", "structural", "collateral-damage"]
  },
  {
    id: "sys_003",
    title: "Tech Transparency Project — 450+ drug ads in Meta's Ad Library while educators were banned",
    org: "Tech Transparency Project / Campaign for Accountability",
    platform: "Instagram / Facebook",
    sector: "Systemic / Research",
    heat: "hot",
    date: "2024-07-31",
    summary: "Tech Transparency Project's analysis found more than 450 ads on Instagram and Facebook selling an array of pharmaceutical and other drugs (search window March 1–June 14, 2024) — in Meta's own Ad Library — while educational organizations, harm reduction nonprofits, and licensed cannabis businesses were being simultaneously banned and shadowbanned. The report demonstrates that Meta's enforcement prioritizes the wrong targets.",
    evidence: "Meta's own Ad Library contained the illegal drug ads while licensed businesses were being removed. The inversion — illegal vendors allowed to advertise, legal educators suppressed — demonstrates structural failure in Meta's moderation system.",
    source: "Tech Transparency Project",
    sourceUrl: "https://www.techtransparencyproject.org/articles/meta-allows-drug-ads-selling-everything-opioids-cocaine",
    tags: ["meta", "instagram", "facebook", "systemic", "research", "enforcement-gap"]
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const redis = {
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    };

    // ── EXA LIVE SEARCH — runs on every cron, adds new incidents automatically ──
    let liveIncidents = [];
    const EXA_KEY = process.env.EXA_API_KEY;

    if (EXA_KEY) {
      try {
        const queries = [
          'Instagram Facebook suspended banned account cannabis dispensary psychedelics wellness 2025 2026',
          'YouTube channel removed demonetized cannabis health harm reduction 2025 2026',
          'TikTok banned account cannabis wellness health creator suppression 2025 2026',
          'Meta platform censorship cannabis psychedelics harm reduction advocacy organization 2025 2026',
          'social media ban shadowban health education drug policy psychedelics 2026'
        ];
        const existingUrls = new Set(VERIFIED_INCIDENTS.map(i => i.sourceUrl));

        for (const q of queries) {
          try {
            const r = await fetch('https://api.exa.ai/search', {
              method: 'POST',
              headers: { 'x-api-key': EXA_KEY, 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: q,
                numResults: 3,
                startPublishedDate: '2025-01-01',
                contents: { text: { maxCharacters: 500 } },
              }),
            });
            const data = await r.json();
            if (data.results) {
              for (const result of data.results) {
                if (!result.title || !result.url) continue;
                if (existingUrls.has(result.url)) continue;
                const id = `exa_${Buffer.from(result.url).toString('base64').slice(0, 12)}`;
                liveIncidents.push({
                  id,
                  title: result.title.slice(0, 120),
                  org: extractOrg(result.title, result.text || ''),
                  platform: extractPlatform(result.title + ' ' + (result.text || '')),
                  sector: extractSector(result.title + ' ' + (result.text || '')),
                  heat: 'warm',
                  date: result.publishedDate ? result.publishedDate.slice(0, 10) : new Date().toISOString().slice(0, 10),
                  summary: (result.text || result.title).slice(0, 500),
                  evidence: 'See source for full documentation.',
                  source: extractDomain(result.url),
                  sourceUrl: result.url,
                  tags: extractTags(result.title + ' ' + (result.text || '')),
                });
                existingUrls.add(result.url);
              }
            }
          } catch (e) { console.error('Exa query error:', e); }
        }
      } catch (e) { console.error('Exa error:', e); }
    }

    // ── MERGE + DEDUPLICATE ────────────────────────────────────────────────
    const allIncidents = [...VERIFIED_INCIDENTS];
    const existingIds = new Set(VERIFIED_INCIDENTS.map(i => i.id));
    for (const inc of liveIncidents) {
      if (!existingIds.has(inc.id)) {
        allIncidents.push(inc);
        existingIds.add(inc.id);
      }
    }

    // ── WRITE TO UPSTASH ──────────────────────────────────────────────────
    const indexKeys = [];
    for (const incident of allIncidents) {
      const key = `aloha:suppression:${incident.id}`;
      await fetch(`${redis.url}/set/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${redis.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(incident),
      });
      indexKeys.push(key);
    }

    await fetch(`${redis.url}/set/${encodeURIComponent('aloha:suppression:index')}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${redis.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(indexKeys),
    });

    return res.status(200).json({
      ok: true,
      verified: VERIFIED_INCIDENTS.length,
      live: liveIncidents.length,
      total: allIncidents.length,
      generatedAt: new Date().toISOString(),
    });
  } catch (e) {
    console.error('Sweep error:', e);
    return res.status(500).json({ ok: false, error: e.message });
  }
}

function extractOrg(title, text) {
  const m = (title + ' ' + text).match(/([A-Z][a-zA-Z\s&']+(?:Magazine|Lab|Center|Institute|Project|Assembly|Foundation|Network|Alliance|Association|Cannabis|Wellness|Media))/);
  return m ? m[1].trim().slice(0, 60) : 'Multiple organizations';
}
function extractPlatform(text) {
  const t = text.toLowerCase();
  const p = [];
  if (t.includes('instagram')) p.push('Instagram');
  if (t.includes('youtube')) p.push('YouTube');
  if (t.includes('tiktok')) p.push('TikTok');
  if (t.includes('facebook')) p.push('Facebook');
  if (t.includes('substack')) p.push('Substack');
  if (t.includes('twitter') || t.includes('x.com')) p.push('X/Twitter');
  return p.length ? p.join(' / ') : 'Social media';
}
function extractSector(text) {
  const t = text.toLowerCase();
  if (t.includes('psychedelic') || t.includes('psilocybin')) return 'Psychedelics';
  if (t.includes('cannabis') || t.includes('marijuana') || t.includes('dispensary')) return 'Cannabis';
  if (t.includes('harm reduction') || t.includes('overdose')) return 'Harm Reduction';
  if (t.includes('health') || t.includes('wellness') || t.includes('medical')) return 'Health / Wellness';
  return 'Health / Advocacy';
}
function extractDomain(url) {
  try { return new URL(url).hostname.replace('www.', ''); } catch { return url; }
}
function extractTags(text) {
  const t = text.toLowerCase();
  const kw = ['instagram','youtube','tiktok','facebook','substack','psychedelics','cannabis',
    'harm-reduction','shadowban','suspension','demonetization','ban','wellness','health',
    'advocacy','media','nonprofit','education','dispensary','racial-equity'];
  return kw.filter(k => t.includes(k.replace('-',' '))).slice(0, 6);
}
