import pandas as pd
import numpy as np
from random import shuffle
from math import ceil
import os

def get_sample_design(
        number_of_items,
        number_of_screens,
        max_items_per_screen,
        screens_with_max,
):
    is_possible_to_show_all_items = max_items_per_screen * number_of_screens >= number_of_items
    if not is_possible_to_show_all_items:
        print(
            f"It's not possible to show {number_of_items} items with these parameters."
            f" At most, only {max_items_per_screen * number_of_screens}"
            " items can be shown."
        )

    max_items_per_each_remaining_screen = get_parameters_for_screens_with_blanks(
        number_of_items,
        screens_with_max,
        max_items_per_screen,
        number_of_screens
    )

    items_per_screen = []
    items_seen = 0
    screen = 1
    for screen in range(number_of_screens):
        if screen < screens_with_max:
            items_per_screen.append(max_items_per_screen)
            items_seen += max_items_per_screen
        else:
            items_left_to_see = number_of_items - items_seen
            if max_items_per_screen > items_left_to_see:
                items_per_screen.append(items_left_to_see)
                items_seen += items_left_to_see
            else:
                items_per_screen.append(max_items_per_each_remaining_screen)
                items_seen += max_items_per_each_remaining_screen

    print({sum(items_per_screen)} == {number_of_items})

    blanks_to_add = sum(
    [max_items_per_screen - number_of_items for number_of_items in items_per_screen])

    example_version = []

    print('\nExample Version\n')
    items = list(range(1, number_of_items + 1))
    shuffle(items)
    start = 0
    for screen_number, items_in_screen in enumerate(items_per_screen):
        end = start + items_in_screen
        added_blanks = [np.nan] * (max_items_per_screen - items_in_screen)
        screen = items[start:end] + added_blanks
        start += items_in_screen
        print(f"Screen {screen_number+1}\t" +
              "\t".join([str(item) for item in screen]))
        example_version.append(screen)

    return example_version, items_per_screen


def get_parameters_for_screens_with_blanks(
        number_of_items,
        screens_with_max,
        max_items_per_screen,
        number_of_screens
):
    items_left_after_all_screens_with_max = number_of_items - screens_with_max * max_items_per_screen
    print(
        f"Based on these parameters, there will be {items_left_after_all_screens_with_max} item(s) remaining after"
        f" {screens_with_max} screens hold {max_items_per_screen} maximum items." )

    screens_left_after_all_screens_with_max = number_of_screens - screens_with_max
    print(
        f"Based on these parameters, there will be {screens_left_after_all_screens_with_max} screen(s) remaining"
        f" after {screens_with_max} screens hold {max_items_per_screen} maximum items.")

    try:
        max_items_per_each_remaining_screen = ceil(
            items_left_after_all_screens_with_max
            / screens_left_after_all_screens_with_max)
        print(
            f"There will be {max_items_per_each_remaining_screen} maximum items per remaining screen(s).")

    except ZeroDivisionError:
        max_items_per_each_remaining_screen = max_items_per_screen
        print(
            f"All screens have reached their maximum number of items per screen. There are no items remaining."
		)
    return max_items_per_each_remaining_screen

def get_full_design(
    versions,
    items_per_screen,
    max_items_per_screen,
    number_of_items
):

    print('Generating Design...')
    items = list(range(1, number_of_items + 1))
    design = []
    blanks_added = []
    for version in range(1, versions+1):
        shuffle(items)
        start = 0
        blank_count = 0
        for screen_number, items_in_screen in enumerate(items_per_screen):
            end = start + items_in_screen
            added_blanks = [np.nan] * (max_items_per_screen - items_in_screen)
            blank_count += len(added_blanks)
            screen = items[start:end] + added_blanks
            start += items_in_screen
            design.append([version, screen_number+1] + screen)
        blanks_added.append(blank_count)

    design_as_df = pd.DataFrame(design, columns=[
                                'Version', 'Set'] + [f'Item{n+1}' for n in range(max_items_per_screen)])

    design_as_df['Blanks'] = design_as_df.isna().sum(axis=1)
    assert len(design_as_df.groupby('Version').sum()['Blanks'].unique()) == 1
    return design_as_df, blanks_added



def validate_design(
    design_as_df,
    number_of_items,
    blanks_added):
    print('\n Running checks...')
    # Design Checks
    # Check for Same Number of Blanks per Version
    design_as_df['Blanks'] = design_as_df.isna().sum(axis=1)
    assert len(design_as_df.groupby('Version').sum()['Blanks'].unique()) == 1

    # Check for Duplicate Versions
    versions = design_as_df.drop('Blanks', axis=1).groupby('Version').groups

    item_cols = [col for col in design_as_df if 'Item' in col]

    deduped_versions = []
    has_duplicates = False
    for version in versions:
        version_indices = versions[version]
        values = design_as_df.loc[versions[version], item_cols].values.tolist()
        if values in deduped_versions:
            has_duplicates = True
            print(f'duplicate {version}')
        else:
            deduped_versions.append(values)

    if not has_duplicates:
        print('✅ No duplicate versions detected')

    unique_sets_of_items_by_version = np.unique(
        design_as_df.groupby(['Version'])[[col for col in design_as_df if 'Item' in col]].apply(
            lambda x: list(np.unique(x, return_counts=True)[1])
        ).values
    )

    #expected_unique_values = number_of_items + blanks_added[0]
    expected_unique_values = number_of_items
    blanks_were_added = blanks_added[0] > 0
    if blanks_were_added:
        expected_unique_values += 1
    print(f'number_of_items={number_of_items}, number of blanks_added={blanks_added[0]}')
    print(f'expected_unique_values(including blanks)={expected_unique_values}')
    print(f'number of unique sets of items in each version={len(unique_sets_of_items_by_version)}')
    print(f'number of unique items in version 1={len(unique_sets_of_items_by_version[0])}')
    print(f'item appears 1 time in version 1={[count == 1 for count in unique_sets_of_items_by_version[0][:number_of_items]]}')
    if (len(unique_sets_of_items_by_version) == 1
            and len(unique_sets_of_items_by_version[0]) == expected_unique_values
            and all([count == 1 for count in unique_sets_of_items_by_version[0][:number_of_items]])):
        print('✅ Each item appears exactly once in each version')

    if len(set(blanks_added)) == 1:
        print(f'✅ Every version has the same number of blanks ({blanks_added[0]})')

    # Output Design
    n = 1
    fn = f'design{n}.xlsx'
    while os.path.exists(fn):
        n += 1
        fn = f'design{n}.xlsx'

    print('\nSaving design...')
    design_as_df.drop('Blanks', axis=1, inplace=True)
    # design_as_df.to_excel(fn, index=False)



def generate_design(
    versions,
    number_of_items,
    number_of_screens,
    max_items_per_screen,
    screens_with_max):

    example_version, items_per_screen = get_sample_design(
        number_of_items,
        number_of_screens,
        max_items_per_screen,
        screens_with_max
    )

    # max_items_per_each_remaining_screen = get_parameters_for_screens_with_blanks(
    #     number_of_items,
    #     screens_with_max,
    #     max_items_per_screen,
    #     number_of_screens
    # )

    design_as_df, blanks_added = get_full_design(
        versions,
        items_per_screen,
        max_items_per_screen,
        number_of_items,
    )

    validate_design(
    design_as_df,
    number_of_items,
    blanks_added
    )
    return design_as_df