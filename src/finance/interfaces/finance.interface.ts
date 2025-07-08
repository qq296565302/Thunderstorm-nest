/**
 * 财经数据接口
 * 定义财经对象的数据结构
 */
export interface Finance {
  /** 财经信息唯一标识符 */
  id: string;
  
  /** 财经标题 */
  title: string;
  
  /** 财经内容 */
  content: string;
  
  /** 作者 */
  author: string;
  
  /** 财经分类 */
  category: string;
  
  /** 发布时间 */
  publishTime: Date;
  
  /** 财经图片URL */
  imageUrl?: string;
  
  /** 标签列表 */
  tags: string[];
  
  /** 浏览次数 */
  viewCount: number;
}

/**
 * 财经分页响应接口
 */
export interface FinanceListResponse {
  /** 财经数据列表 */
  data: Finance[];
  
  /** 总数量 */
  total: number;
  
  /** 当前页码 */
  page: number;
  
  /** 每页数量 */
  limit: number;
}