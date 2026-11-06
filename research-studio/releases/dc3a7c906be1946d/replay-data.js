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
      previousPublished: null,
      revision: null,
      version: 'first print',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_06072024.htm',
      sourceLabel: 'BLS Employment Situation, June 7, 2024 archive',
      knownBefore: [
        '发布前只能看到更早月份的数据；本期值与本次修订尚未公布。',
        '非农就业来自机构调查（establishment survey），失业率来自住户调查（household survey），两者口径不同。'
      ],
      afterRelease: [
        '5 月非农就业初报增加 27.2 万，失业率 4.0%。',
        '这是初报值。后续月份可能修订，因此先记录当时可知的版本，再与 7 月公告对照。'
      ],
      practice: {
        question: '这份公告先记录了什么？为什么不能把 27.2 万当作最终值？',
        answer: '它记录的是 5 月非农就业的初报值 27.2 万。初报之后仍可能被修订，7 月 5 日的公告就把 5 月值改为 21.8 万。'
      },
      caveat: '本记录只支持劳动市场数据解读；不包含市场一致预期，不能据此判断“超预期”或资产方向。'
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
      revision: { nonfarmPayrolls: 218, unemploymentRate: 4.0, note: 'May 2024 payrolls revised from 272 to 218; unemployment rate unchanged at 4.0.' },
      version: 'current release with prior-month revision',
      sourceUrl: 'https://www.bls.gov/news.release/archives/empsit_07052024.htm',
      sourceLabel: 'BLS Employment Situation, July 5, 2024 archive',
      knownBefore: [
        '6 月 7 日已经公布 5 月非农就业初报 27.2 万、失业率 4.0%。',
        '本次公告同时公布 6 月本期值和 5 月修订值；发布前不应提前看到这两项。'
      ],
      afterRelease: [
        '6 月非农就业增加 20.6 万，失业率 4.1%。',
        '同一份公告把 5 月新增就业从 27.2 万修订为 21.8 万。',
        '非农岗位数来自机构调查；失业率来自住户调查。两者可以给出不同信号。'
      ],
      practice: {
        question: '分别找出：6 月本期值、5 月上次公布值、5 月本次修订值。三者为什么不能混用？',
        answer: '6 月本期值 20.6 万；5 月上次公布值 27.2 万；5 月本次修订值 21.8 万。上次公布值与修订值属于同一统计期的不同版本，混用会把修订误当成新增就业。'
      },
      caveat: '没有可核验的市场一致预期，页面不显示“超预期”。公告本身也不足以确定股市当天涨跌。'
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
      seasonalAdjustment: 'Month-over-month is seasonally adjusted; year-over-year is not seasonally adjusted.',
      current: { cpiMonthOverMonth: -0.1, cpiYearOverYear: 3.0 },
      previousPublished: null,
      revision: null,
      version: 'first print',
      sourceUrl: 'https://www.bls.gov/news.release/archives/cpi_07112024.htm',
      sourceLabel: 'BLS CPI, July 11, 2024 archive',
      knownBefore: [
        '发布前只能看到更早月份的 CPI；6 月环比与同比尚未公布。',
        '环比和同比的时间窗口不同，季调与非季调口径也不同。'
      ],
      afterRelease: [
        '6 月 CPI-U 季调环比下降 0.1%，未经季调同比上涨 3.0%。',
        '一个月价格下降可以和过去一年价格上涨同时成立：同比比较的是 12 个月窗口，环比只比较相邻两个月。'
      ],
      practice: {
        question: '为什么“6 月环比 −0.1%”和“同比 +3.0%”可以同时出现？',
        answer: '两者窗口不同。环比只比较 6 月与 5 月，同比比较 2024 年 6 月与 2023 年 6 月；此外环比是季调口径，同比未经季调。'
      },
      caveat: '本案例不提供无法核验的市场预期，也不把 CPI 公告直接解释成某一行业或指数的涨跌。'
    }
  ];

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
  return { RELEASES, OPTION_CASES, INDUSTRY_CASES, CONSUMER_CONFIDENCE, SOURCE_CHECK, RELEASE_NOTE, byId };
});
