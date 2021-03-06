//    Copyright 2019 EPAM Systems, Inc.
// 
//    Licensed under the Apache License, Version 2.0 (the "License");
//    you may not use this file except in compliance with the License.
//    You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
//    Unless required by applicable law or agreed to in writing, software
//    distributed under the License is distributed on an "AS IS" BASIS,
//    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//    See the License for the specific language governing permissions and
//    limitations under the License.

import classNames from 'classnames';
import * as React from 'react';

import { FilterProps, FilterState } from './models';

export default class Filter extends React.Component<FilterProps, FilterState> {
  public constructor(props: FilterProps) {
    super(props);

    this.state = {
      isValuesVisible: true,
    };
  }
  public render() {
    const { first, facet, IsApplied, HandleFacetOnChange } = this.props;
    const { isValuesVisible } = this.state;
    return (
      <div className={classNames({ 'filter-first': first })}>
        <div className="filter">
          <div className="filter_toggle">
            <h3 className="filter_name">{facet.displayName}</h3>
          </div>
          {isValuesVisible && (
            <ul className="filter_options options show-all-links">
              {facet.foundValues &&
                facet.foundValues.filter((v) => v.aggregateCount !== 0).sort((a, b) => {
                  const nameA = a.name.toLowerCase();
                  const nameB = b.name.toLowerCase();
                  if (nameA < nameB) {
                    return -1;
                  }
                  if (nameA > nameB) {
                    return 1;
                  }
                  return 0;
                 }).map((foundValue, i) => {
                  const id = `${foundValue.name}${foundValue.aggregateCount}${i}`;
                  return (
                    <li key={i}>
                      <input
                        type="checkbox"
                        id={id}
                        checked={IsApplied(facet.name, foundValue.name)}
                        onChange={(e) => HandleFacetOnChange(facet.name, foundValue.name, e)}
                      />
                      <label htmlFor={id} title={foundValue.name}>{`${foundValue.name}`}</label>
                      <span>{`(${foundValue.aggregateCount})`}</span>
                    </li>
                  );
                })}
            </ul>
          )}
          <a
            onClick={(e) => this.toggleFacetVisibility(e)}
            className={classNames('view-all', { 'hide-all': isValuesVisible })}
          >
            <span>{isValuesVisible ? 'Hide all' : 'Show All'}</span>
          </a>
        </div>
      </div>
    );
  }

  private toggleFacetVisibility(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    e.stopPropagation();

    this.setState({
      isValuesVisible: !this.state.isValuesVisible,
    });
  }
}
