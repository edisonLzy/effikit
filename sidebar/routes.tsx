import { createMemoryRouter } from 'react-router';
import { 
  Calculator, 
  Calendar, 
  Database, 
  FileText, 
  Globe, 
  Hash, 
  Image, 
  Lock,
  Key, 
  Mail, 
  Music, 
  Palette, 
  Search, 
  Settings, 
  Users, 
  Zap,
  Code,
  BookOpen,
  MessageSquare,
  Cloud,
  Download,
  Upload,
  Monitor,
  Smartphone,
  Wifi,
  Shield,
  Archive,
  BarChart,
  PieChart,
  TrendingUp,
  Clock,
  Bell,
  MapPin,
  Compass,
  Target,
  Gift,
  Star,
  Heart,
  Coffee,
  Gamepad2,
  Video,
  Headphones,
  Mic,
  Camera as CameraIcon,
  Edit3,
  Scissors,
  Crop,
  Layers,
  Filter,
  Brush,
  Eraser,
  AlertTriangle,
  Link
} from 'lucide-react';
import { Layout } from './layout';
import { Home } from './Home';
import { NotebookLLM } from './tools/NotebookLLM';
import { URLEncoder } from './tools/URLEncoder';
import { JSONViewer } from './tools/JSONViewer';
import { Base64Encoder } from './tools/Base64Encoder';
import { ColorPicker } from './tools/ColorPicker';
import { RequestInterceptor } from './tools/RequestInterceptor';
import { NotFoundPage } from './404';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorTestComponent } from './components/ErrorTestComponent';
import type { RouteObject } from 'react-router';
import type { ReactNode } from 'react';

type RouteHandle = {
  label: string;
  icon: ReactNode;
  description: string;
};

// 占位符组件
const PlaceholderTool = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <p className="text-gray-600">工具开发中...</p>
    </div>
  </div>
);

export const toolRoutes: RouteObject[] = [
  {
    path:'NotebookLLM',
    element: <NotebookLLM />,
    handle: {
      label: 'NotebookLLM',
      description: '智能笔记助手，帮助您创建和管理知识库',
      icon: <BookOpen className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ErrorTest',
    element: <ErrorTestComponent />,
    handle: {
      label: '错误测试',
      description: '测试错误边界组件的功能',
      icon: <AlertTriangle className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Calculator',
    element: <PlaceholderTool title="计算器" />,
    handle: {
      label: '计算器',
      description: '强大的科学计算器，支持复杂数学运算',
      icon: <Calculator className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Calendar',
    element: <PlaceholderTool title="日历" />,
    handle: {
      label: '日历',
      description: '智能日程管理，提醒重要事件',
      icon: <Calendar className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ImageEditor',
    element: <PlaceholderTool title="图片编辑器" />,
    handle: {
      label: '图片编辑',
      description: '在线图片编辑和处理工具',
      icon: <Image className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'CodeEditor',
    element: <PlaceholderTool title="代码编辑器" />,
    handle: {
      label: '代码编辑',
      description: '支持多语言的在线代码编辑器',
      icon: <Code className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ColorPalette',
    element: <ColorPicker />,
    handle: {
      label: '颜色选择器',
      description: '颜色格式转换、调色板生成和设计配色工具',
      icon: <Palette className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'PasswordGenerator',
    element: <PlaceholderTool title="密码生成器" />,
    handle: {
      label: '密码生成',
      description: '生成安全可靠的随机密码',
      icon: <Lock className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'EmailTemplate',
    element: <PlaceholderTool title="邮件模板" />,
    handle: {
      label: '邮件模板',
      description: '快速创建专业的邮件模板',
      icon: <Mail className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'MusicPlayer',
    element: <PlaceholderTool title="音乐播放器" />,
    handle: {
      label: '音乐播放',
      description: '轻量级在线音乐播放器',
      icon: <Music className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'WebSearch',
    element: <PlaceholderTool title="网络搜索" />,
    handle: {
      label: '网络搜索',
      description: '集成多个搜索引擎的智能搜索',
      icon: <Search className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'HashGenerator',
    element: <PlaceholderTool title="哈希生成器" />,
    handle: {
      label: '哈希生成',
      description: '生成MD5、SHA等各种哈希值',
      icon: <Hash className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'RequestInterceptor',
    element: <RequestInterceptor />,
    handle: {
      label: 'HTTP拦截器',
      description: 'HTTP请求拦截和Mock响应工具',
      icon: <Globe className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'URLEncoder',
    element: <URLEncoder />,
    handle: {
      label: 'URL编码',
      description: '对URL进行编码和解码处理，支持中文字符和特殊符号',
      icon: <Link className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'JSONViewer',
    element: <JSONViewer />,
    handle: {
      label: 'JSON查看器',
      description: 'JSON格式化、验证、压缩和美化工具',
      icon: <FileText className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Base64Encoder',
    element: <Base64Encoder />,
    handle: {
      label: 'Base64编码',
      description: '支持文本和图片的Base64编码解码转换',
      icon: <Key className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'DatabaseViewer',
    element: <PlaceholderTool title="数据库查看器" />,
    handle: {
      label: '数据库查看',
      description: '可视化数据库查询和管理工具',
      icon: <Database className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'TextEditor',
    element: <PlaceholderTool title="文本编辑器" />,
    handle: {
      label: '文本编辑',
      description: '功能丰富的markdown文本编辑器',
      icon: <FileText className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'UserManager',
    element: <PlaceholderTool title="用户管理" />,
    handle: {
      label: '用户管理',
      description: '团队协作用户权限管理系统',
      icon: <Users className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Settings',
    element: <PlaceholderTool title="设置" />,
    handle: {
      label: '设置',
      description: '个性化配置和系统设置',
      icon: <Settings className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'APITester',
    element: <PlaceholderTool title="API测试器" />,
    handle: {
      label: 'API测试',
      description: '快速测试和调试API接口',
      icon: <Zap className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'URLShortener',
    element: <PlaceholderTool title="URL缩短器" />,
    handle: {
      label: 'URL缩短',
      description: '将长网址转换为短链接',
      icon: <Globe className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ChatBot',
    element: <PlaceholderTool title="智能聊天" />,
    handle: {
      label: '智能聊天',
      description: 'AI驱动的智能对话助手',
      icon: <MessageSquare className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'CloudStorage',
    element: <PlaceholderTool title="云存储" />,
    handle: {
      label: '云存储',
      description: '安全可靠的云端文件存储服务',
      icon: <Cloud className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'FileDownloader',
    element: <PlaceholderTool title="文件下载器" />,
    handle: {
      label: '文件下载',
      description: '批量下载和管理网络文件',
      icon: <Download className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'FileUploader',
    element: <PlaceholderTool title="文件上传器" />,
    handle: {
      label: '文件上传',
      description: '快速上传和分享文件',
      icon: <Upload className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ScreenRecorder',
    element: <PlaceholderTool title="屏幕录制" />,
    handle: {
      label: '屏幕录制',
      description: '高质量屏幕录制和截图工具',
      icon: <Monitor className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'MobileOptimizer',
    element: <PlaceholderTool title="移动优化" />,
    handle: {
      label: '移动优化',
      description: '移动端性能和兼容性优化',
      icon: <Smartphone className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'NetworkMonitor',
    element: <PlaceholderTool title="网络监控" />,
    handle: {
      label: '网络监控',
      description: '实时监控网络状态和流量',
      icon: <Wifi className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'SecurityScanner',
    element: <PlaceholderTool title="安全扫描" />,
    handle: {
      label: '安全扫描',
      description: '检测系统漏洞和安全威胁',
      icon: <Shield className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'BackupManager',
    element: <PlaceholderTool title="备份管理" />,
    handle: {
      label: '备份管理',
      description: '自动化数据备份和恢复系统',
      icon: <Archive className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'DataAnalytics',
    element: <PlaceholderTool title="数据分析" />,
    handle: {
      label: '数据分析',
      description: '强大的数据可视化分析平台',
      icon: <BarChart className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ChartGenerator',
    element: <PlaceholderTool title="图表生成器" />,
    handle: {
      label: '图表生成',
      description: '快速创建各种类型的数据图表',
      icon: <PieChart className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'TrendAnalyzer',
    element: <PlaceholderTool title="趋势分析" />,
    handle: {
      label: '趋势分析',
      description: '智能分析数据趋势和预测',
      icon: <TrendingUp className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'TimeTracker',
    element: <PlaceholderTool title="时间追踪" />,
    handle: {
      label: '时间追踪',
      description: '专业的工作时间管理和统计',
      icon: <Clock className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'NotificationCenter',
    element: <PlaceholderTool title="通知中心" />,
    handle: {
      label: '通知中心',
      description: '统一管理所有应用通知',
      icon: <Bell className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'LocationTracker',
    element: <PlaceholderTool title="位置追踪" />,
    handle: {
      label: '位置追踪',
      description: 'GPS定位和地理信息服务',
      icon: <MapPin className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Navigator',
    element: <PlaceholderTool title="导航助手" />,
    handle: {
      label: '导航助手',
      description: '智能路径规划和导航服务',
      icon: <Compass className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'GoalTracker',
    element: <PlaceholderTool title="目标追踪" />,
    handle: {
      label: '目标追踪',
      description: '设定和跟踪个人目标进度',
      icon: <Target className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'RewardSystem',
    element: <PlaceholderTool title="奖励系统" />,
    handle: {
      label: '奖励系统',
      description: '游戏化的任务完成奖励机制',
      icon: <Gift className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Favorites',
    element: <PlaceholderTool title="收藏夹" />,
    handle: {
      label: '收藏夹',
      description: '管理和组织您的收藏内容',
      icon: <Star className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Wishlist',
    element: <PlaceholderTool title="心愿单" />,
    handle: {
      label: '心愿单',
      description: '记录和分享您的心愿清单',
      icon: <Heart className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'BreakTimer',
    element: <PlaceholderTool title="休息提醒" />,
    handle: {
      label: '休息提醒',
      description: '番茄钟和健康工作提醒',
      icon: <Coffee className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'GameCenter',
    element: <PlaceholderTool title="游戏中心" />,
    handle: {
      label: '游戏中心',
      description: '休闲小游戏和娱乐平台',
      icon: <Gamepad2 className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'VideoEditor',
    element: <PlaceholderTool title="视频编辑" />,
    handle: {
      label: '视频编辑',
      description: '专业的在线视频编辑套件',
      icon: <Video className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'AudioEditor',
    element: <PlaceholderTool title="音频编辑" />,
    handle: {
      label: '音频编辑',
      description: '多轨音频录制和编辑工具',
      icon: <Headphones className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'VoiceRecorder',
    element: <PlaceholderTool title="语音录制" />,
    handle: {
      label: '语音录制',
      description: '高品质语音录制和转文字',
      icon: <Mic className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'PhotoStudio',
    element: <PlaceholderTool title="照片工作室" />,
    handle: {
      label: '照片工作室',
      description: '专业照片拍摄和后期处理',
      icon: <CameraIcon className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'AnnotationTool',
    element: <PlaceholderTool title="标注工具" />,
    handle: {
      label: '标注工具',
      description: '图片和文档标注编辑器',
      icon: <Edit3 className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ClippingTool',
    element: <PlaceholderTool title="剪切工具" />,
    handle: {
      label: '剪切工具',
      description: '精确的图像和文本剪切工具',
      icon: <Scissors className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'CropTool',
    element: <PlaceholderTool title="裁剪工具" />,
    handle: {
      label: '裁剪工具',
      description: '智能图片裁剪和调整尺寸',
      icon: <Crop className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'LayerEditor',
    element: <PlaceholderTool title="图层编辑" />,
    handle: {
      label: '图层编辑',
      description: '多图层图像合成和编辑',
      icon: <Layers className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'FilterStudio',
    element: <PlaceholderTool title="滤镜工作室" />,
    handle: {
      label: '滤镜工作室',
      description: '丰富的图像滤镜和特效库',
      icon: <Filter className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'DigitalBrush',
    element: <PlaceholderTool title="数字画笔" />,
    handle: {
      label: '数字画笔',
      description: '专业的数字绘画和插画工具',
      icon: <Brush className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'SmartEraser',
    element: <PlaceholderTool title="智能橡皮擦" />,
    handle: {
      label: '智能橡皮擦',
      description: 'AI驱动的智能背景去除工具',
      icon: <Eraser className="w-4 h-4" />,
    } satisfies RouteHandle
  }
];

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'tool',
        children: toolRoutes
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);