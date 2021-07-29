#!/bin/python
import googlemaps
import pandas
import os
from datetime import datetime, timezone, timedelta

OFFICES = ['2021 7th Ave, Seattle, WA 98121', '1209 124th Ave NE, Bellevue, WA 98005']
# Maximum time you're willing to transit, including walking
MAX_DIRECTIONS_DURATION_MINS = 50
TIMEZONE = timezone(timedelta(hours=-8))
# When you arrive at work i.e. 8:00 AM on a Monday
ARRIVAL_TIME = str(int(datetime(2021, 8, 2, 9, 00, 00, tzinfo=TIMEZONE).timestamp()))

gmaps = googlemaps.Client(key=os.environ['API_KEY'])

apartments_df = pandas.read_csv("apartments.tsv", delimiter='\t')
apartment_addresses = apartments_df.address.tolist()

def chunked(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))

for i, office in enumerate(OFFICES):
    distance = []
    duration = []
    fare = []
    for chunk in chunked(list(enumerate(apartment_addresses)), 25):
        distance_matrix_response = gmaps.distance_matrix(
            [address for _, address in chunk],
            office,
            mode='transit',
            traffic_model='best_guess',
            transit_routing_preference='fewer_transfers',
            region='us',
            arrival_time=ARRIVAL_TIME
        )

        for j in range(len(chunk)):
            distance_matrix_row_element = distance_matrix_response['rows'][j]['elements'][0]
            try:
                distance.append(distance_matrix_row_element['distance']['value'])
            except KeyError:
                distance.append('N/A')
            try:
                duration.append(int(distance_matrix_row_element['duration']['value']) / 60)
            except KeyError:
                # It's not a proper address or it's impossible to get to by transit
                duration.append(MAX_DIRECTIONS_DURATION_MINS + 1)
            try:
                fare.append(distance_matrix_row_element['fare']['text'])
            except KeyError:
                fare.append('N/A')
            print(f"{chunk[j][0]+1}/{len(apartment_addresses)}", distance[-1], duration[-1], fare[-1])
    apartments_df[f'distance_{i}'] = distance
    apartments_df[f'duration_{i}'] = duration
    apartments_df[f'fare_{i}'] = fare

for i in range(len(OFFICES)):
    apartments_df = apartments_df[apartments_df[f'duration_{i}'] < MAX_DIRECTIONS_DURATION_MINS]
apartments_df['max_duration'] = apartments_df[[f'duration_{i}' for i in range(len(OFFICES))]].max(axis=1)
apartments_df['mean_duration'] = apartments_df[[f'duration_{i}' for i in range(len(OFFICES))]].mean(axis=1)

print(f"Filtered down from {len(apartment_addresses)} to {len(apartments_df)}")
apartments_df = apartments_df.sort_values(by='max_duration')
apartments_df.to_csv('apartments-with-distance.tsv', sep='\t', index=False)
