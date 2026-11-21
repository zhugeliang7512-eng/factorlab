(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FactorLabReplay = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const RELEASES = [
    {
      id: 'BLS-EMP-20240607',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'May 2024',
      releaseAt: '2024-06-07T12:30:00.000Z',
      releaseLocal: '2024-06-07 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      previousPublished: { nonfarmPayrolls: 175, unemploymentRate: 3.9 },
      revision: { nonfarmPayrolls: 165 },
      earlierRevision: { month: { 'zh-CN': '3 月', en: 'March' }, before: 315, after: 310 },
      version: 'first print with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_06072024.htm',
      sourceLabel: 'BLS Employment Situation, June 7, 2024 archive',
      knownBefore: {
        'zh-CN': ['5 月 3 日公布的 4 月初报为新增非农就业 17.5 万、失业率 3.9%。', '非农岗位数来自机构调查，失业率来自住户调查。'],
        en: ['The May 3 release initially reported 175k added payrolls and 3.9% unemployment for April.', 'Payrolls come from the establishment survey. Unemployment comes from the household survey.']
      },
      practice: {
        question: { 'zh-CN': '哪些是 5 月本期初报？哪些是对 4 月和 3 月的修订？', en: 'Which figures are initial estimates for May, and which revise April and March?' },
        answer: { 'zh-CN': '新增非农就业和失业率是 5 月初报。4 月和 3 月新增非农就业是对之前月份的修订。引用时同时记录统计月份、公告日期和版本。', en: 'The current payroll change and unemployment rate are initial May estimates. The April and March changes revise earlier months. Cite the observation month, release date and data vintage together.' }
      },
      caveat: { 'zh-CN': '用这些数值解读就业。判断市场是否意外还需要可核验的发布前一致预期。', en: 'Use these figures to interpret employment. Identifying a market surprise requires a verifiable pre-release consensus.' }
    },
    {
      id: 'BLS-EMP-20240705',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Employment Situation',
      period: 'June 2024',
      releaseAt: '2024-07-05T12:30:00.000Z',
      releaseLocal: '2024-07-05 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { nonfarmPayrolls: 'thousand jobs, monthly change', unemploymentRate: 'percent' },
      seasonalAdjustment: 'Nonfarm payroll employment and unemployment rate are seasonally adjusted.',
      current: { nonfarmPayrolls: 206, unemploymentRate: 4.1 },
      previousPublished: { nonfarmPayrolls: 272, unemploymentRate: 4.0 },
      revision: { nonfarmPayrolls: 218 },
      earlierRevision: { month: { 'zh-CN': '4 月', en: 'April' }, before: 165, after: 108 },
      version: 'current release with prior-month revisions',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_07052024.htm',
      sourceLabel: 'BLS Employment Situation, July 5, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 7 日已公布 5 月新增非农就业初报 27.2 万、失业率 4.0%。', '这次公告将发布 6 月数值，并可能调整先前月份的估计。'],
        en: ['The June 7 release initially reported 272k added payrolls and 4.0% unemployment for May.', 'This release will report June and may update estimates for earlier months.']
      },
      practice: {
        question: { 'zh-CN': '分别找出 6 月本期值、5 月上次公布值和 5 月本次修订值。', en: 'Find the June figure, the May first print and the revised May figure.' },
        answer: { 'zh-CN': '先区分统计月份。5 月的首次公布值和本次修订值是同一月份的两个版本。比较 5 月与 6 月时，请说明你用的是哪个版本。', en: 'Separate the observation months first. The first print and revised May value are two vintages of the same month. State which vintage you use when comparing May and June.' }
      },
      caveat: { 'zh-CN': '判断市场是否意外还需要可核验的发布前一致预期。判断股市表现需要对应日期的价格证据。', en: 'Identifying a surprise requires a verifiable pre-release consensus. Assessing the equity market requires price evidence from the relevant date.' }
    },
    {
      id: 'BLS-CPI-20240711',
      institution: 'U.S. Bureau of Labor Statistics',
      indicator: 'Consumer Price Index for All Urban Consumers (CPI-U)',
      period: 'June 2024',
      releaseAt: '2024-07-11T12:30:00.000Z',
      releaseLocal: '2024-07-11 08:30 America/New_York',
      timezone: 'America/New_York',
      units: { cpiMonthOverMonth: 'percent, seasonally adjusted', cpiYearOverYear: 'percent, not seasonally adjusted' },
      seasonalAdjustment: { 'zh-CN': '环比采用季调，同比采用未经季调的数值。', en: 'Month-over-month is seasonally adjusted. Year-over-year is unadjusted.' },
      current: { cpiMonthOverMonth: -0.1, cpiYearOverYear: 3.0 },
      version: 'first print',
      sourceUrl: 'https://www.bls.gov/news.release/archives/cpi_07112024.htm',
      sourceLabel: 'BLS CPI, July 11, 2024 archive',
      knownBefore: {
        'zh-CN': ['6 月 12 日公布的 5 月 CPI-U 季调环比持平，未季调同比上涨 3.3%。', '环比和同比各自对应不同的比较窗口。'],
        en: ['The June 12 release reported flat May CPI-U month-over-month after seasonal adjustment and 3.3% unadjusted year-over-year growth.', 'Month-over-month and year-over-year compare different time windows.']
      },
      practice: {
        question: { 'zh-CN': '为何本期环比可以下降，而同比仍然上涨？', en: 'How can prices decline month-over-month and still be higher year-over-year?' },
        answer: { 'zh-CN': '环比和同比采用不同基期。先区分一个月与十二个月的窗口，再核对季调口径。', en: 'The two measures use different reference periods. Distinguish one month from twelve months, then check the adjustment basis.' }
      },
      caveat: { 'zh-CN': '这份回放可用来理解物价变化。推断利率或股票表现还需要当时的预期与价格证据。', en: 'This release describes changes in consumer prices. Inferences about rates or equities require contemporaneous expectations and price evidence.' }
    }
  ];

  function releaseSnapshot(id, revealed, lang = 'zh-CN') {
    const release = byId(id);
    if (!release) return null;
    const locale = lang === 'en' ? 'en' : 'zh-CN';
    const visible = {
      id: release.id,
      institution: release.institution,
      indicator: release.indicator,
      period: release.period,
      releaseLocal: release.releaseLocal,
      knownBefore: release.knownBefore[locale],
      caveat: release.caveat[locale]
    };
    if (revealed !== true) return visible;
    const en = locale === 'en';
    const tr = (zh, english) => en ? english : zh;
    const payroll = value => en ? value + 'k' : (value / 10).toFixed(1) + ' 万';
    const percent = value => value.toFixed(1) + '%';
    const { current, previousPublished, revision, earlierRevision } = release;
    const rows = current.nonfarmPayrolls !== undefined ? [
      [tr('本期非农就业变动','Current payroll change'), payroll(current.nonfarmPayrolls)],
      [tr('本期失业率','Current unemployment rate'), percent(current.unemploymentRate)],
      [tr('上期首次公布（非农）','Prior first print (payrolls)'), payroll(previousPublished.nonfarmPayrolls)],
      [tr('上期本次修订（非农）','Prior payrolls revised in this release'), payroll(revision.nonfarmPayrolls)],
      [tr('再前一期修订（非农）','Earlier payroll revision'), earlierRevision.month[locale] + ' · ' + payroll(earlierRevision.before) + ' → ' + payroll(earlierRevision.after)]
    ] : [
      [tr('CPI 环比（季调）','CPI month over month (SA)'), percent(current.cpiMonthOverMonth)],
      [tr('CPI 同比（未季调）','CPI year over year (NSA)'), percent(current.cpiYearOverYear)],
      [tr('季调口径','Seasonal adjustment'), release.seasonalAdjustment[locale]]
    ];
    return {
      ...visible, rows,
      question: release.practice.question[locale],
      guidance: release.practice.answer[locale],
      source: { label: release.sourceLabel, url: release.sourceUrl }
    };
  }

  const OPTION_CASES = [
    {
      id: 'LUV-2022-FUEL-HEDGE',
      company: 'Southwest Airlines',
      year: 2022,
      title: { 'zh-CN': '航空公司为什么支付权利金做燃油套保？', en: 'Why would an airline pay premiums for fuel hedges?' },
      facts: [
        { 'zh-CN': '2022 年年报披露，燃油套保组合的现金结算收益约为每加仑 0.49 美元，权利金费用约为每加仑 0.04 美元。', en: 'The 2022 annual report disclosed a cash settlement gain from fuel hedges of about USD 0.49 per gallon and premium costs of about USD 0.04 per gallon.' },
        { 'zh-CN': '套保组合包含多种衍生工具，不能把全部收益归给一笔 Call。', en: 'The portfolio included multiple derivatives; the total gain cannot be attributed to a single call option.' }
      ],
      question: { 'zh-CN': '油价上涨时，航空公司为什么仍要考虑套保成本？', en: 'If fuel prices rise, why should the airline still consider hedging costs?' },
      answer: { 'zh-CN': '套保可以减少燃油成本上升的冲击，但权利金本身是成本；而且原油与航油价格存在基差，套保并非完全消除风险。', en: 'Hedging can reduce the impact of higher fuel costs, but premiums are a cost and jet-fuel basis risk remains; hedging does not eliminate risk.' },
      sourceUrl: 'https://www.sec.gov/Archives/edgar/data/92380/000009238023000010/luv-20221231.htm',
      sourceLabel: 'Southwest Airlines 2022 Form 10-K, Item 7 and Note 11'
    },
    {
      id: 'GME-2021-OPTIONS',
      company: 'GameStop',
      year: 2021,
      title: { 'zh-CN': '期权成交暴增是否足以证明做市商推高股价？', en: 'Does an options-volume surge prove market makers pushed the stock up?' },
      facts: [
        { 'zh-CN': 'SEC 工作人员报告记载，个人客户期权成交金额从 2021-01-21 的约 5,850 万美元增至 2021-01-27 的约 24 亿美元，增量主要来自买入 Put。', en: 'The SEC staff report recorded retail customer options trading value rising from about USD 58.5 million on 2021-01-21 to about USD 2.4 billion on 2021-01-27, with the increase mainly in purchased puts.' },
        { 'zh-CN': '工作人员在可得数据中未找到当月发生 gamma squeeze 的证据。', en: 'Staff did not find evidence in the available data of a gamma squeeze that month.' }
      ],
      question: { 'zh-CN': '看见期权成交暴增，还需要确认哪一方买入了什么合约？', en: 'After seeing an options-volume surge, what still needs to be established about who bought which contracts?' },
      answer: { 'zh-CN': '成交量只说明合约换手增加。要讨论方向性压力，必须区分买方/卖方、Call/Put、是否开仓，以及做市商对冲与后续价格反应。', en: 'Volume only shows more contracts traded. Directional pressure requires distinguishing buyer and seller, calls and puts, whether positions opened, and dealer hedging and subsequent price response.' },
      sourceUrl: 'https://www.sec.gov/files/staff-report-equity-options-market-struction-conditions-early-2021.pdf',
      sourceLabel: 'SEC Staff Report on Equity and Options Market Structure Conditions in Early 2021, section 3.4'
    }
  ];

  const INDUSTRY_CASES = [
    {
      id: 'semiconductor',
      name: { 'zh-CN': '半导体', en: 'Semiconductors' },
      longTerm: { 'zh-CN': '跟踪晶圆出货量、先进制程占比与资本开支；这些反映产能与产品结构。', en: 'Track wafer shipments, leading-edge process mix and capital spending; these show capacity and product mix.' },
      shortTerm: { 'zh-CN': '下一季订单、库存天数、产品售价与交付周期是否同步改善。', en: 'Check whether next-quarter orders, inventory days, product pricing and lead times improve together.' },
      counterExample: { 'zh-CN': '台积电 2024 年十二英寸等效晶圆出货量从上年约 1,200 万片增至 1,290 万片，7nm 及以下制程占晶圆收入比例从 58% 升至 69%。但同一轮需求变化，对代工、存储、设备的兑现时间可以不同。', en: 'TSMC increased 12-inch equivalent wafer shipments from about 12.0 million to 12.9 million in 2024, and the share of wafer revenue from 7nm and below rose from 58% to 69%. Yet the same demand change can reach foundry, memory and equipment earnings at different times.' },
      appliesTo: { 'zh-CN': '适用于代工与先进制程环节；不能直接套用到所有半导体公司。', en: 'Applies to foundry and leading-edge processes; not directly to every semiconductor company.' },
      sourceUrl: 'https://investor.tsmc.com/static/annualReports/2024/english/index.html',
      sourceLabel: 'TSMC 2024 Annual Report'
    },
    {
      id: 'robotics',
      name: { 'zh-CN': '机器人', en: 'Robotics' },
      longTerm: { 'zh-CN': '跟踪工业机器人年安装量、区域分布与自动化投资周期。', en: 'Track annual industrial-robot installations, regional mix and the automation investment cycle.' },
      shortTerm: { 'zh-CN': '订单、交付、市场份额与客户资本开支是否支持某家供应商下季收入。', en: 'Check orders, deliveries, market share and customer capex that would support a supplier’s next-quarter revenue.' },
      counterExample: { 'zh-CN': 'IFR 统计 2024 年全球工厂新装约 54.2 万台工业机器人，其中亚洲占 74%。安装量反映已落地的设备需求；推断某家供应商下季收入还需订单、市场份额与交付证据。', en: 'IFR recorded about 542,000 industrial robots installed in factories globally in 2024, with Asia at 74%. Installations reflect realized equipment demand; inferring a supplier’s next-quarter revenue still requires orders, share and delivery evidence.' },
      appliesTo: { 'zh-CN': '适用于工业自动化设备与集成环节。', en: 'Applies to industrial automation equipment and integration.' },
      sourceUrl: 'https://ifr.org/ifr-press-releases/news/global-robot-demand-in-factories-doubles-over-10-years',
      sourceLabel: 'IFR press release on 2024 robot installations'
    },
    {
      id: 'materials',
      name: { 'zh-CN': '先进材料', en: 'Advanced materials' },
      longTerm: { 'zh-CN': '跟踪终端需求、产能扩张、库存与材料价格；需求增长不等于售价上涨。', en: 'Track end demand, capacity additions, inventories and material prices; demand growth does not imply rising prices.' },
      shortTerm: { 'zh-CN': '现货价格、库存拐点、长协价格与客户补库是否改变利润。', en: 'Check spot prices, inventory inflection, contract prices and restocking that change margins.' },
      counterExample: { 'zh-CN': 'IEA 记录 2024 年锂需求增长近 30%，同时锂价自 2023 年以来跌逾 80%。需求增长与售价下跌可以同时发生；该案例适用于电池材料环节，不能直接套用到教学篮子中的先进合金。', en: 'The IEA recorded lithium demand growth of nearly 30% in 2024 while lithium prices fell more than 80% from 2023. Demand growth and falling prices can coexist; this applies to battery materials, not directly to the teaching basket’s advanced alloys.' },
      appliesTo: { 'zh-CN': '仅适用于电池材料等特定环节。', en: 'Only specific segments such as battery materials.' },
      sourceUrl: 'https://www.iea.org/reports/global-critical-minerals-outlook-2025/executive-summary',
      sourceLabel: 'IEA Global Critical Minerals Outlook 2025, executive summary'
    },
    {
      id: 'energy',
      name: { 'zh-CN': '清洁能源装备', en: 'Clean energy equipment' },
      longTerm: { 'zh-CN': '跟踪装机、产能利用率、组件价格与成本曲线。', en: 'Track installations, utilization, module prices and the cost curve.' },
      shortTerm: { 'zh-CN': '产能、售价、订单与原材料成本是否同向变化；装机扩张可能伴随设备企业利润承压。', en: 'Check whether capacity, prices, orders and input costs move together; installation growth can coincide with equipment-maker margin pressure.' },
      counterExample: { 'zh-CN': 'IEA 记录全球光伏组件价格自 2023 年初以来跌逾一半。装机扩张与设备企业利润可能背离，应同时观察产能、售价和成本；光伏案例不能代替储能或电网设备数据。', en: 'The IEA recorded global solar PV module prices falling by more than half since early 2023. Installation growth and equipment-maker profits can diverge; watch capacity, prices and costs. The solar case does not replace storage or grid-equipment data.' },
      appliesTo: { 'zh-CN': '仅适用于光伏组件等环节。', en: 'Only segments such as solar modules.' },
      sourceUrl: 'https://www.iea.org/reports/renewables-2024/executive-summary',
      sourceLabel: 'IEA Renewables 2024, executive summary'
    },
    {
      id: 'digital',
      name: { 'zh-CN': 'AI 基础设施', en: 'AI infrastructure' },
      longTerm: { 'zh-CN': '跟踪算力需求、云业务收入与毛利率、资本开支。', en: 'Track compute demand, cloud revenue and gross margin, and capital spending.' },
      shortTerm: { 'zh-CN': '算力投入支持设备需求，但会先增加云服务商成本；先确定分析的是设备商还是运营方。', en: 'Compute investment supports equipment demand but first raises cloud operators’ costs; decide whether you are analyzing equipment makers or operators.' },
      counterExample: { 'zh-CN': '微软 FY2025 云业务毛利率降至 69%，公司将下降部分归因于 AI 基础设施扩张。算力投入可支持设备需求，也会先增加云服务商成本。', en: 'Microsoft’s FY2025 cloud gross margin fell to 69%, with the company attributing part of the decline to AI infrastructure expansion. Compute investment can support equipment demand while first raising cloud operators’ costs.' },
      appliesTo: { 'zh-CN': '适用于区分设备商与云运营方的分析。', en: 'Applies when separating equipment makers from cloud operators.' },
      sourceUrl: 'https://www.microsoft.com/investor/reports/ar25/',
      sourceLabel: 'Microsoft FY2025 Annual Report'
    }
  ];

  const CONSUMER_CONFIDENCE = {
    title: { 'zh-CN': '消费者信心：两个不同指数', en: 'Consumer confidence: two different indices' },
    body: {
      'zh-CN': '密歇根大学消费者情绪指数（University of Michigan Surveys of Consumers）与 The Conference Board 消费者信心指数（Consumer Confidence Index）由不同机构编制，问题、样本和发布节奏不同。首版只提供概念和原始来源，待选定系列并核实转载条款后再加入数值回放。',
      en: 'The University of Michigan Surveys of Consumers and The Conference Board Consumer Confidence Index are produced by different organizations with different questions, samples and release schedules. This first version provides concepts and primary sources only; numeric replay awaits a selected series and verified redistribution terms.'
    },
    sources: [
      { label: 'University of Michigan data FAQ', url: 'https://data.sca.isr.umich.edu/faq.php' },
      { label: 'The Conference Board consumer confidence', url: 'https://www.conference-board.org/topics/consumer-confidence' }
    ]
  };

  const SOURCE_CHECK = {
    title: { 'zh-CN': '传闻该用哪份原始文件核对？', en: 'Which primary document should verify the rumor?' },
    claim: {
      'zh-CN': '社交媒体说：“供应链订单明显改善，公司下季收入一定会超预期。”',
      en: 'A social post says: “Supply-chain orders improved sharply, so next-quarter revenue will definitely beat expectations.”'
    },
    options: [
      { id: 'company', label: { 'zh-CN': '公司公告、财报与订单披露', en: 'Company filings and order disclosures' } },
      { id: 'bls', label: { 'zh-CN': '美国劳工统计局就业报告', en: 'BLS Employment Situation' } },
      { id: 'repost', label: { 'zh-CN': '同一说法的其他转载', en: 'Other reposts of the same claim' } }
    ],
    answer: 'company',
    feedback: {
      'zh-CN': '优先核对公司公告、财报和可验证的订单披露。BLS 就业报告不覆盖这家公司的订单；同源转载不是独立确认。即使订单改善，也还要看交付、收入和估值。',
      en: 'Check company filings and verifiable order disclosures first. The BLS employment report does not cover this company’s orders, and reposts are not independent confirmation. Even improving orders still require delivery, revenue and valuation evidence.'
    }
  };

  const RELEASE_NOTE = {
    'zh-CN': '真实宏观回放与合成教学账本分开。实际公告日期与游戏模拟日各自显示；这些数值不进入合成收益计算。',
    en: 'Real macro replay is separate from the synthetic teaching ledger. Actual release dates and simulation days are shown separately; these values do not enter synthetic returns.'
  };

  const byId = id => RELEASES.find(item => item.id === id) || null;
  return { RELEASES, OPTION_CASES, INDUSTRY_CASES, CONSUMER_CONFIDENCE, SOURCE_CHECK, RELEASE_NOTE, byId, releaseSnapshot };
});
