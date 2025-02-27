//
// Copyright IBM Corp. 2022
//
// This source code is licensed under the Apache-2.0 license found in the
// LICENSE file in the root directory of this source tree.
//

import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Tag } from 'carbon-components-react';
import { Tearsheet, TearsheetNarrow } from '../../components/Tearsheet';
import { NoDataEmptyState } from '../../components/EmptyStates/NoDataEmptyState';
import { AddSelectSidebar } from './AddSelectSidebar';
import { AddSelectBreadcrumbs } from './AddSelectBreadcrumbs';
import { AddSelectList } from './AddSelectList';
import { AddSelectColumn } from './AddSelectColumn';
import { AddSelectFilter } from './AddSelectFilter';
import { AddSelectSort } from './AddSelectSort';
import { sortItems, getFilteredItems } from './add-select-utils';
import { useItemSort } from './hooks/useItemSort';
import useParentSelect from './hooks/useParentSelect';
import usePath from './hooks/usePath';
import { pkg } from '../../settings';

const blockClass = `${pkg.prefix}--add-select`;
const componentName = 'AddSelectBody';

export let AddSelectBody = forwardRef(
  (
    {
      className,
      clearFiltersText,
      closeIconDescription,
      columnInputPlaceholder,
      defaultModifiers,
      description,
      globalFilterOpts,
      globalFiltersLabel,
      globalFiltersIconDescription,
      globalFiltersPlaceholderText,
      globalFiltersPrimaryButtonText,
      globalFiltersSecondaryButtonText,
      globalSearchLabel,
      globalSearchPlaceholder,
      globalSortBy,
      illustrationTheme,
      influencerTitle,
      items,
      itemsLabel,
      metaIconDescription,
      metaPanelTitle,
      multi,
      navIconDescription,
      noResultsDescription,
      noResultsTitle,
      noSelectionDescription,
      noSelectionTitle,
      normalizedItems,
      onClose,
      onCloseButtonText,
      onSubmit,
      onSubmitButtonText,
      open,
      portalTarget,
      searchResultsTitle,
      title,
      useNormalizedItems,
      ...rest
    },
    ref
  ) => {
    // hooks
    const [singleSelection, setSingleSelection] = useState('');
    const [multiSelection, setMultiSelection] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [appliedGlobalFilters, setAppliedGlobalFilters] = useState({});
    const [displayMetalPanel, setDisplayMetaPanel] = useState({});
    const [appliedModifiers, setAppliedModifiers] = useState(defaultModifiers);
    const { sortDirection, setSortDirection, sortAttribute, setSortAttribute } =
      useItemSort();
    const { parentSelected, setParentSelected } = useParentSelect();
    const { path, setPath, pathOnclick, resetPath } = usePath(itemsLabel);

    const resetState = () => {
      setSingleSelection('');
      setMultiSelection([]);
      setSearchTerm('');
      setAppliedGlobalFilters({});
      setDisplayMetaPanel({});
      setAppliedModifiers(defaultModifiers);
      setSortAttribute('');
      setSortDirection('');
      setParentSelected(null);
      resetPath();
    };

    const onCloseHandler = () => {
      resetState();
      onClose();
    };

    const tearsheetClassnames = cx(className, blockClass, {
      [`${blockClass}__single`]: !multi,
      [`${blockClass}__multi`]: multi,
    });

    const globalFilterKeys = Object.keys(appliedGlobalFilters);
    const globalFiltersApplied = globalFilterKeys.length > 0;

    // handlers
    const handleSearch = (term) => {
      setSearchTerm(term);
    };

    const handleFilter = (filters) => {
      setAppliedGlobalFilters(filters);
    };

    const submitHandler = () => {
      if (multi && appliedModifiers.length > 0) {
        const selections = multiSelection.map((item) => {
          return appliedModifiers.find((mod) => mod.id === item);
        });
        onSubmit(selections);
      } else if (multi && appliedModifiers.length === 0) {
        onSubmit(multiSelection);
      } else {
        onSubmit(singleSelection);
      }
      onCloseHandler();
    };

    const setShowBreadsCrumbs = () => {
      if (useNormalizedItems === false || searchTerm || globalFiltersApplied) {
        return false;
      }
      return true;
    };

    const setShowTags = () => {
      if (searchTerm) {
        return true;
      }
      if (useNormalizedItems) {
        return false;
      }
      return true;
    };

    const parentSelectionHandler = (id, title, parentId) => {
      setParentSelected(id);
      setPath(id, title, parentId);
    };

    const sortFn = sortItems(sortAttribute, sortDirection);
    const itemsToDisplay = getFilteredItems(
      useNormalizedItems,
      normalizedItems,
      searchTerm,
      globalFiltersApplied,
      globalFilterKeys,
      appliedGlobalFilters,
      sortFn,
      multi,
      items,
      path
    );
    const hasResults = itemsToDisplay.length > 0;
    const showBreadsCrumbs = setShowBreadsCrumbs();
    const showSort = (searchTerm || globalFiltersApplied) && hasResults;
    const showTags = setShowTags();

    const commonListProps = {
      displayMetalPanel,
      metaIconDescription,
      multi,
      multiSelection,
      navIconDescription,
      path,
      setMultiSelection,
      setPath,
      setSingleSelection,
      singleSelection,
      setDisplayMetaPanel,
      parentId: path[0].id,
    };

    const commonTearsheetProps = {
      ...rest,
      className: tearsheetClassnames,
      open,
      title,
      description,
      actions: [
        {
          label: onCloseButtonText,
          kind: 'secondary',
          onClick: onCloseHandler,
        },
        {
          label: onSubmitButtonText,
          kind: 'primary',
          onClick: submitHandler,
          disabled: multi ? multiSelection.length === 0 : !singleSelection,
        },
      ],
      portalTarget,
      ref,
    };

    const sidebarProps = {
      appliedModifiers,
      closeIconDescription,
      displayMetalPanel,
      illustrationTheme,
      influencerTitle,
      items: useNormalizedItems ? normalizedItems : items.entries,
      metaPanelTitle,
      modifiers: items.modifiers,
      multiSelection,
      noSelectionDescription,
      noSelectionTitle,
      setDisplayMetaPanel,
    };

    const displayColumnView =
      multi && useNormalizedItems && !searchTerm && !globalFiltersApplied;

    // main content
    const body = (
      <>
        <div className={`${blockClass}__header`}>
          <AddSelectFilter
            inputLabel={globalSearchLabel}
            inputPlaceholder={globalSearchPlaceholder}
            searchTerm={searchTerm}
            handleSearch={handleSearch}
            multi={multi}
            filterOpts={globalFilterOpts}
            filtersLabel={globalFiltersLabel}
            handleFilter={handleFilter}
            primaryButtonText={globalFiltersPrimaryButtonText}
            secondaryButtonText={globalFiltersSecondaryButtonText}
            placeholder={globalFiltersPlaceholderText}
            iconDescription={globalFiltersIconDescription}
            appliedFilters={appliedGlobalFilters}
            hasFiltersApplied={globalFiltersApplied}
            clearFiltersText={clearFiltersText}
          />
          <div
            className={cx(`${blockClass}__sub-header`, {
              [`${blockClass}__sub-header-multi`]: multi,
            })}
          >
            <div className={`${blockClass}__tags`}>
              {showBreadsCrumbs ? (
                <AddSelectBreadcrumbs
                  path={path}
                  onClick={pathOnclick}
                  multi={multi}
                />
              ) : (
                <p className={`${blockClass}__tags-label`}>
                  {searchTerm ? searchResultsTitle : itemsLabel}
                </p>
              )}
              {showTags && (
                <Tag type="gray" size="sm">
                  {itemsToDisplay.length}
                </Tag>
              )}
            </div>
            {showSort && (
              <AddSelectSort
                items={itemsToDisplay}
                setSortAttribute={setSortAttribute}
                setSortDirection={setSortDirection}
                sortAttribute={sortAttribute}
                sortDirection={sortDirection}
                sortBy={globalSortBy}
              />
            )}
          </div>
        </div>
        {displayColumnView ? (
          <div className={`${blockClass}__columns`}>
            <AddSelectColumn
              {...commonListProps}
              items={itemsToDisplay}
              columnInputPlaceholder={columnInputPlaceholder}
              header={path[0]?.title}
            />
          </div>
        ) : (
          <div>
            {hasResults ? (
              <AddSelectList
                {...commonListProps}
                filteredItems={itemsToDisplay}
                modifiers={items.modifiers}
                appliedModifiers={appliedModifiers}
                setAppliedModifiers={setAppliedModifiers}
                setParentSelected={parentSelectionHandler}
                parentSelected={parentSelected}
                parentId={parentSelected || path[0].id}
              />
            ) : (
              <div className={`${blockClass}__body`}>
                <NoDataEmptyState
                  subtitle={noResultsDescription}
                  title={noResultsTitle}
                  illustrationTheme={illustrationTheme}
                />
              </div>
            )}
          </div>
        )}
      </>
    );

    if (multi) {
      return (
        <Tearsheet
          {...commonTearsheetProps}
          influencer={multi && <AddSelectSidebar {...sidebarProps} />}
          influencerPosition="right"
        >
          {body}
        </Tearsheet>
      );
    }

    return <TearsheetNarrow {...commonTearsheetProps}>{body}</TearsheetNarrow>;
  }
);

AddSelectBody.propTypes = {
  className: PropTypes.string,
  clearFiltersText: PropTypes.string,
  closeIconDescription: PropTypes.string,
  columnInputPlaceholder: PropTypes.string,
  defaultModifiers: PropTypes.array,
  description: PropTypes.string,
  globalFilterOpts: PropTypes.array,
  globalFiltersIconDescription: PropTypes.string,
  globalFiltersLabel: PropTypes.string,
  globalFiltersPlaceholderText: PropTypes.string,
  globalFiltersPrimaryButtonText: PropTypes.string,
  globalFiltersSecondaryButtonText: PropTypes.string,
  globalSearchLabel: PropTypes.string.isRequired,
  globalSearchPlaceholder: PropTypes.string,
  globalSortBy: PropTypes.array,
  illustrationTheme: PropTypes.oneOf(['light', 'dark']),
  influencerTitle: PropTypes.string,
  items: PropTypes.shape({
    modifiers: PropTypes.shape({
      id: PropTypes.string,
      label: PropTypes.string,
      options: PropTypes.array,
    }),
    sortBy: PropTypes.array,
    filterBy: PropTypes.array,
    entries: PropTypes.arrayOf(
      PropTypes.shape({
        avatar: PropTypes.shape({
          alt: PropTypes.string,
          icon: PropTypes.object,
          src: PropTypes.string,
          theme: PropTypes.oneOf(['light', 'dark']),
        }),
        children: PropTypes.object,
        icon: PropTypes.object,
        id: PropTypes.string.isRequired,
        meta: PropTypes.oneOfType([
          PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.string,
              title: PropTypes.string,
              value: PropTypes.string,
            })
          ),
          PropTypes.node,
        ]),
        subtitle: PropTypes.string,
        title: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
      })
    ),
  }),
  itemsLabel: PropTypes.string,
  metaIconDescription: PropTypes.string,
  metaPanelTitle: PropTypes.string,
  multi: PropTypes.bool,
  navIconDescription: PropTypes.string,
  noResultsDescription: PropTypes.string,
  noResultsTitle: PropTypes.string,
  noSelectionDescription: PropTypes.string,
  noSelectionTitle: PropTypes.string,
  normalizedItems: PropTypes.object,
  onClose: PropTypes.func,
  onCloseButtonText: PropTypes.string,
  onSubmit: PropTypes.func,
  onSubmitButtonText: PropTypes.string,
  open: PropTypes.bool,
  portalTarget: PropTypes.node,
  searchResultsTitle: PropTypes.string,
  title: PropTypes.string,
  useNormalizedItems: PropTypes.bool,
};

AddSelectBreadcrumbs.displayName = componentName;
