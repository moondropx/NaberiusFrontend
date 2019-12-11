import * as React from 'react';
import { Layout, Collapse, Drawer, Menu } from 'antd';
import gql from 'graphql-tag';
import _ from 'lodash';
import { MISSION_TYPE } from './types';
import MissionShutter from './MissionShutter';
import useRouter from 'use-react-router';
import { useQuery } from '@apollo/react-hooks';
import { useMediaQuery } from 'react-responsive';
import Quest from '../Quest';
import Loading from '../../Loading';
import styles from './QuestList.module.less';
import { useState } from 'react';

const { Content, Sider } = Layout;
const Panel = Collapse.Panel;

const QuestList: React.FC = () => {
  const { match, history } = useRouter<{ QuestID: string }>();
  const { QuestID } = match.params;

  const [currentMissionType, setCurrentMissionType] = useState('Emergency');

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 991px)' });

  const { loading, data } = useQuery<{
    missions: Array<{
      Name: string;
      Type: string;
      MissionID: number;
    }>;
  }>(
    gql`
      query {
        missions {
          Name
          Type
          MissionID
        }
      }
    `,
  );

  const missions = data ? Object.entries(_.groupBy(data.missions, 'Type')) : [];

  return (
    <Layout style={{ position: 'relative' }}>
      <Sider theme="light" className={styles.sider}>
        <Menu
          theme="light"
          selectedKeys={[currentMissionType]}
          onSelect={p => setCurrentMissionType(p.key)}
        >
          {loading ? (
            <Loading />
          ) : (
            missions.map(([key]) => (
              <Menu.Item key={key}>{MISSION_TYPE[key]}</Menu.Item>
            ))
          )}
        </Menu>
      </Sider>
      <Content style={{ position: 'relative' }}>
        <div
          style={{
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Content className={styles.missionListContent}>
            {!loading ? (
              <Collapse bordered={false}>
                {missions
                  .find(m => m[0] === currentMissionType)![1]
                  .map(mission => (
                    <Panel
                      key={mission.MissionID}
                      header={
                        <span>
                          {mission.MissionID}
                          &nbsp;
                          <strong>{mission.Name}</strong>
                        </span>
                      }
                    >
                      <MissionShutter
                        mission={mission}
                        isTabletOrMobile={isTabletOrMobile}
                      />
                    </Panel>
                  ))}
              </Collapse>
            ) : (
              <Loading />
            )}
          </Content>
        </div>
        <Drawer
          width={isTabletOrMobile ? '100%' : '80%'}
          visible={!!QuestID}
          destroyOnClose
          onClose={() => history.push('/quest')}
          getContainer={false}
          style={{ position: 'absolute' }}
        >
          {QuestID && <Quest />}
        </Drawer>
      </Content>
    </Layout>
  );
};

export default QuestList;
