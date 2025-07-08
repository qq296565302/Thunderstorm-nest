import { Injectable } from '@nestjs/common';
import { Finance } from './interfaces/finance.interface';

/**
 * 财经服务类
 * 处理财经相关的业务逻辑
 */
@Injectable()
export class FinanceService {
  // 模拟财经数据
  private readonly mockFinance: Finance[] = [
    {
      id: '1',
      title: '全球股市震荡：科技股领跌',
      content: '受通胀担忧影响，全球主要股指今日普遍下跌，科技股成为重灾区。纳斯达克指数下跌2.5%，道琼斯工业平均指数下跌1.8%。',
      author: '财经分析师',
      category: 'stock',
      publishTime: new Date('2024-01-15T10:00:00Z'),
      imageUrl: 'https://example.com/stock1.jpg',
      tags: ['股市', '科技股', '全球市场'],
      viewCount: 2150,
    },
    {
      id: '2',
      title: '央行宣布降准0.5个百分点',
      content: '为支持实体经济发展，央行决定于本月16日下调金融机构存款准备金率0.5个百分点，释放长期资金约1万亿元。',
      author: '央行发言人',
      category: 'monetary',
      publishTime: new Date('2024-01-15T08:30:00Z'),
      imageUrl: 'https://example.com/monetary1.jpg',
      tags: ['央行', '降准', '货币政策'],
      viewCount: 3200,
    },
    {
      id: '3',
      title: '比特币价格突破5万美元大关',
      content: '加密货币市场迎来强劲反弹，比特币价格突破5万美元，创下近期新高。以太坊等主流加密货币也出现大幅上涨。',
      author: '加密货币分析师',
      category: 'crypto',
      publishTime: new Date('2024-01-14T16:20:00Z'),
      imageUrl: 'https://example.com/crypto1.jpg',
      tags: ['比特币', '加密货币', '数字资产'],
      viewCount: 1890,
    },
    {
      id: '4',
      title: '房地产市场政策调整：多城放宽限购',
      content: '为促进房地产市场平稳健康发展，多个一二线城市宣布放宽限购政策，降低购房门槛，支持刚需和改善性住房需求。',
      author: '房产分析师',
      category: 'realestate',
      publishTime: new Date('2024-01-14T14:15:00Z'),
      imageUrl: 'https://example.com/realestate1.jpg',
      tags: ['房地产', '政策', '限购'],
      viewCount: 2750,
    },
    {
      id: '5',
      title: '新能源汽车销量创历史新高',
      content: '据统计，本月新能源汽车销量同比增长45%，创历史新高。特斯拉、比亚迪等头部企业表现亮眼，推动整个行业快速发展。',
      author: '汽车行业分析师',
      category: 'automotive',
      publishTime: new Date('2024-01-14T12:00:00Z'),
      imageUrl: 'https://example.com/automotive1.jpg',
      tags: ['新能源', '汽车', '销量'],
      viewCount: 1650,
    },
  ];

  /**
   * 获取财经列表
   * @param page 页码
   * @param limit 每页数量
   * @returns 分页的财经列表
   */
  async getFinanceList(
    page: number,
    limit: number,
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = this.mockFinance.slice(startIndex, endIndex);

    return {
      data,
      total: this.mockFinance.length,
      page: Number(page),
      limit: Number(limit),
    };
  }

  /**
   * 根据ID获取财经详情
   * @param id 财经ID
   * @returns 财经详情
   */
  async getFinanceById(id: string): Promise<Finance> {
    const finance = this.mockFinance.find((item) => item.id === id);
    if (!finance) {
      throw new Error(`财经信息ID ${id} 不存在`);
    }
    // 增加浏览量
    finance.viewCount += 1;
    return finance;
  }

  /**
   * 根据分类获取财经信息
   * @param category 财经分类
   * @param page 页码
   * @param limit 每页数量
   * @returns 分类财经列表
   */
  async getFinanceByCategory(
    category: string,
    page: number,
    limit: number,
  ): Promise<{ data: Finance[]; total: number; page: number; limit: number }> {
    const filteredFinance = this.mockFinance.filter(
      (finance) => finance.category === category,
    );
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = filteredFinance.slice(startIndex, endIndex);

    return {
      data,
      total: filteredFinance.length,
      page: Number(page),
      limit: Number(limit),
    };
  }
}