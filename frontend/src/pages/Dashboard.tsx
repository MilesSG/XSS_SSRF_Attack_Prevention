import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic } from 'antd';
import { SecurityScanOutlined, BugOutlined, LinkOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import { AttackStatistics, RecentAttack } from '../types/attack';
import socketService from '../services/socket';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AttackStatistics | null>(null);

  useEffect(() => {
    // 连接WebSocket并开始监控
    socketService.connect();
    socketService.startMonitoring();
    socketService.onStatsUpdate(setStats);

    return () => {
      socketService.stopMonitoring();
      socketService.disconnect();
    };
  }, []);

  const getChartOption = () => {
    if (!stats) return {};

    return {
      title: {
        text: '攻击成功率统计',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['成功', '失败'],
        top: 30
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: ['XSS攻击', 'SSRF攻击', '联合攻击']
      },
      yAxis: {
        type: 'value',
        name: '攻击次数'
      },
      series: [
        {
          name: '成功',
          type: 'bar',
          stack: 'total',
          data: [
            stats.attacksByType.xss.successful,
            stats.attacksByType.ssrf.successful,
            stats.attacksByType.combined.successful
          ]
        },
        {
          name: '失败',
          type: 'bar',
          stack: 'total',
          data: [
            stats.attacksByType.xss.failed,
            stats.attacksByType.ssrf.failed,
            stats.attacksByType.combined.failed
          ]
        }
      ]
    };
  };

  const getTimelineOption = () => {
    if (!stats) return {};

    const recentAttacks = stats.recentAttacks.slice().reverse();
    return {
      title: {
        text: '最近攻击时间线',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis',
        formatter: (params: any) => {
          const attack = recentAttacks[params[0].dataIndex];
          return `
            时间: ${new Date(attack.timestamp).toLocaleString()}<br/>
            类型: ${attack.type}<br/>
            状态: ${attack.status}<br/>
            结果: ${attack.success ? '成功' : '失败'}
          `;
        }
      },
      xAxis: {
        type: 'category',
        data: recentAttacks.map(attack => 
          new Date(attack.timestamp).toLocaleTimeString()
        )
      },
      yAxis: {
        type: 'value',
        show: false
      },
      series: [
        {
          type: 'line',
          data: recentAttacks.map(attack => attack.success ? 1 : 0),
          itemStyle: {
            color: '#1890ff'
          },
          lineStyle: {
            width: 2
          },
          symbol: 'circle',
          symbolSize: 8
        }
      ]
    };
  };

  if (!stats) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <Row gutter={16}>
        <Col span={8}>
          <Card>
            <Statistic
              title="XSS攻击"
              value={stats.attacksByType.xss.successRate}
              precision={2}
              valueStyle={{ color: '#3f8600' }}
              prefix={<BugOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="SSRF攻击"
              value={stats.attacksByType.ssrf.successRate}
              precision={2}
              valueStyle={{ color: '#cf1322' }}
              prefix={<SecurityScanOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="联合攻击"
              value={stats.attacksByType.combined.successRate}
              precision={2}
              valueStyle={{ color: '#1890ff' }}
              prefix={<LinkOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card title="攻击统计">
            <ReactECharts option={getChartOption()} style={{ height: '400px' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="攻击时间线">
            <ReactECharts option={getTimelineOption()} style={{ height: '400px' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard; 