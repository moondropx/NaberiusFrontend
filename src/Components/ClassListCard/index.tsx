import React from 'react';
import { Row, Col, Icon, Input, Spin } from 'antd';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';
import _ from 'lodash';

interface ClassListCardProps {
  class: any;
  classes: any[];
  // onHashChange: (e: Event) => void;
}

interface ClassListCardStates {
  active: boolean;
  success: boolean;
  nickName: string[];
}

export default class ClassListCard extends React.Component<
  ClassListCardProps,
  ClassListCardStates
> {
  public state: ClassListCardStates = {
    active: false,
    success: false,
    nickName: this.props.class.NickName || [],
  };

  public flashSuccess = () => {
    this.setState({ success: true });
    setTimeout(() => {
      this.setState({ success: false });
    }, 1000);
  };

  public getClass(classID: number, genLink = false, index: number) {
    const unitClass = _.find(this.props.classes, ['ClassID', classID]);
    if (unitClass) {
      return (
        <span key={`link-to-${classID}-${index}`} className="label">
          {unitClass.Name}
        </span>
      );
    } else {
      return null;
    }
  }

  public render() {
    const { class: unitClass, ...res } = this.props;
    return (
      <Row
        {...res}
        id={unitClass.ClassID}
        className="list-card class-list-card"
        style={{ cursor: 'default' }}
      >
        <Col span={2}>{unitClass.ClassID}</Col>
        <Col span={3} className={unitClass.notBase ? '' : 'important'}>
          {unitClass.Name}
        </Col>
        <Col span={3}>
          {unitClass.JobChange
            ? this.getClass(unitClass.JobChange, true, 0)
            : null}
        </Col>
        <Col span={6}>
          {[
            unitClass.JobChangeMaterial1,
            unitClass.JobChangeMaterial2,
            unitClass.JobChangeMaterial3,
          ]
            .map((mat: number, index: number) =>
              this.getClass(mat, false, index),
            )
            .filter(c => c)}
        </Col>
        <Col span={5}>
          {[unitClass.Data_ExtraAwakeOrb1, unitClass.Data_ExtraAwakeOrb2]
            .map((mat: number, index: number) =>
              this.getClass(mat, false, index),
            )
            .filter(c => c)}
        </Col>
        <Col span={5}>
          {[unitClass.AwakeType1, unitClass.AwakeType2]
            .map((mat: number, index: number) =>
              this.getClass(mat, true, index),
            )
            .filter(c => c)}
        </Col>
        {!unitClass.notBase && (
          <div
            className={
              `list-card-addon ` +
              (this.state.active && 'active ') +
              (this.state.success && 'success')
            }
            onClick={e => {
              e.stopPropagation();
            }}
          >
            <Mutation<{}, { ClassID: number; NickName: string[] }>
              mutation={gql`
                mutation updateClassMeta($ClassID: Int!, $NickName: [String]) {
                  updateClassMeta(ClassID: $ClassID, NickName: $NickName) {
                    NickName
                  }
                }
              `}
              onCompleted={this.flashSuccess}
            >
              {(updateClassMeta, { loading }) => (
                <Spin spinning={loading}>
                  <Row>
                    <Col span={2}>
                      <Icon
                        onClick={() =>
                          this.setState({ active: !this.state.active })
                        }
                        style={{ cursor: 'pointer' }}
                        type={
                          this.state.active ? 'right-circle' : 'left-circle'
                        }
                        theme="outlined"
                      />
                    </Col>
                    <Col span={20}>
                      <span className="label">昵称:</span>
                      <Input
                        value={this.state.nickName.join(',')}
                        onChange={e =>
                          this.setState({
                            nickName: e.target.value.split(/[,， ]/),
                          })
                        }
                      />
                    </Col>
                    <Col span={2}>
                      <Icon
                        type="check-circle"
                        theme="filled"
                        style={{ cursor: 'pointer' }}
                        onClick={() =>
                          updateClassMeta({
                            variables: {
                              ClassID: unitClass.ClassID,
                              NickName: this.state.nickName,
                            },
                          })
                        }
                      />
                    </Col>
                  </Row>
                </Spin>
              )}
            </Mutation>
          </div>
        )}
      </Row>
    );
  }
}
