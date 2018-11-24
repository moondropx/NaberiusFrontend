import * as React from 'react';
import { Spin, Layout, Col, Row, Pagination, Popover, Input, Tag } from 'antd';
import { Query } from 'react-apollo';
import gql from 'graphql-tag';
import classNames from 'classnames';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import DescriptionInput from '../../DescriptionInput';
import AbilityConfigTable from '../../AbilityConfigTable';
import styles from './index.module.less';

const { Content, Sider } = Layout;
const { Search } = Input;

interface AbilityListStates {
  currentPage: number;
  search: string;
  IDFilter: number[];
}

class AbilityList extends React.Component<any, AbilityListStates> {
  public state = {
    currentPage: 1,
    search: '',
    IDFilter: [],
  };
  public setSearch = (search: string) => {
    this.setState({ search, currentPage: 1 });
  };
  public handleIDFilterChange = (newFilter: number[]) => {
    this.setState({ IDFilter: newFilter, currentPage: 1 });
  };
  public abilityFilter = (ability: any) => {
    if (this.state.IDFilter.length > 0) {
      for (const ID of this.state.IDFilter) {
        const index = ability.Config.findIndex(
          (config: any) => config._InfluenceType === ID,
        );
        if (index === -1) {
          return false;
        }
      }
    }
    if (
      this.state.search &&
      !JSON.stringify(ability).includes(this.state.search)
    ) {
      return false;
    }
    return true;
  };
  private findIDindex(ID: number) {
    return this.state.IDFilter.findIndex(fiteredID => fiteredID === ID);
  }
  private handleToggleFilter(ID: number) {
    const index = this.findIDindex(ID);
    const { IDFilter } = this.state;
    if (index > -1) {
      this.setState({
        IDFilter: [...IDFilter.slice(0, index), ...IDFilter.slice(index + 1)],
      });
    } else {
      this.setState({ IDFilter: [...IDFilter, ID] });
    }
  }
  public render() {
    return (
      <Query
        query={gql`
          query {
            abilities {
              AbilityID
              Text
              AbilityName
              Config {
                _InvokeType
                _TargetType
                _InfluenceType
                _Param1
                _Param2
                _Param3
                _Param4
                _Command
                _ActivateCommand
              }
              CardHave {
                CardID
                Name
              }
            }
            abilityConfigMetas {
              ID
              Description
            }
          }
        `}
      >
        {({ loading, error, data }) => {
          let maxID = 1;
          if (data.abilities) {
            data.abilities.forEach((ability: any) => {
              ability.Config.forEach((config: any) => {
                if (config._InfluenceType > maxID) {
                  maxID = config._InfluenceType;
                }
              });
            });
          }
          return (
            <>
              <Sider className={styles.sider}>
                <Spin spinning={loading}>
                  {data.abilityConfigMetas &&
                    Array.apply(null, { length: maxID }).map(
                      (dummy: any, index: number) => {
                        const config: any = _.find(data.abilityConfigMetas, {
                          ID: index + 1,
                        });

                        return (
                          <DescriptionInput
                            key={index + 1}
                            ID={index + 1}
                            config={config}
                            mutationFunction="updateAbilityConfigMeta"
                            active={this.findIDindex(index + 1) > -1}
                            onToggleFilter={() =>
                              this.handleToggleFilter(index + 1)
                            }
                          />
                        );
                      },
                    )}
                </Spin>
              </Sider>
              <Content
                className={classNames([
                  'container',
                  styles.abilityListContainer,
                ])}
              >
                <Spin spinning={loading}>
                  <div className={styles.tagBar}>
                    {this.state.IDFilter.map(filter => (
                      <Tag
                        color="blue"
                        key={filter}
                        closable
                        onClose={this.handleToggleFilter.bind(this, filter)}
                      >
                        {filter}
                      </Tag>
                    ))}
                  </div>
                  <Search
                    placeholder="搜索单位"
                    value={this.state.search}
                    onChange={event => {
                      this.setSearch(event.target.value);
                    }}
                    enterButton
                  />
                  <Row className="sorter-block">
                    <Col span={8}>名称</Col>
                    <Col span={16}>描述</Col>
                  </Row>
                  {data.abilities &&
                    data.abilities
                      .filter(this.abilityFilter)
                      .slice(
                        50 * (this.state.currentPage - 1),
                        50 * this.state.currentPage,
                      )
                      .map((ability: any, index: number) => {
                        return (
                          <Popover
                            key={index}
                            content={<AbilityConfigTable ability={ability} />}
                          >
                            <Row
                              className="list-card"
                              style={{ cursor: 'default' }}
                            >
                              <Col className="important" span={8}>
                                {ability.AbilityName}
                              </Col>
                              <Col className="important" span={16}>
                                {ability.Text}
                              </Col>
                              <Col span={24}>
                                {ability.CardHave.map((card: any) => (
                                  <Link
                                    style={{ margin: '0 5px' }}
                                    to={`/unit/${card.CardID}`}
                                    key={card.CardID}
                                  >
                                    {card.Name}
                                  </Link>
                                ))}
                              </Col>
                            </Row>
                          </Popover>
                        );
                      })}
                  {data.abilities && (
                    <Pagination
                      defaultCurrent={1}
                      defaultPageSize={50}
                      current={this.state.currentPage}
                      onChange={page => this.setState({ currentPage: page })}
                      total={data.abilities.filter(this.abilityFilter).length}
                    />
                  )}
                </Spin>
              </Content>
            </>
          );
        }}
      </Query>
    );
  }
}

export default AbilityList;