#!/bin/python
import googlemaps
import pandas
import os
from pytz import timezone
from datetime import date, datetime, time, timedelta
import logging

logging.basicConfig(level=logging.INFO)

# Places you want to know how far your apartment is from (i.e. the office)
POINTS_OF_INTEREST = [
    "Fremont Troll",
    "Gas Works Park"
]

# Maximum time you're willing to travel to each POI
MAX_DIRECTIONS_DURATION_MINS = [30, 15]

# If the time bound should be required on all locations (True), or at least one (False)
MAX_DIRECTIONS_DURATION_AND = True

# Pacific Timezone
TIMEZONE = timezone("US/Pacific")
# When you arrive at work i.e. by 9:00 AM
ARRIVAL_TIME = time(hour=9)
# Day of week, 0 = Monday
DAY_OF_WEEK = 0

ARRIVAL_DATE = datetime.today() + timedelta(
    days=(DAY_OF_WEEK - date.today().weekday() + 7) % 7
)
ARRIVAL_DATE_TIME = TIMEZONE.localize(
    datetime.combine(date=ARRIVAL_DATE, time=ARRIVAL_TIME)
)
ARRIVAL_TIMESTAMP = str(int(ARRIVAL_DATE_TIME.timestamp()))

# See options at https://googlemaps.github.io/google-maps-services-python/docs/index.html#googlemaps.Client.distance_matrix
TRANSIT_OPTS = [
    {
        "mode": "transit",
        "traffic_model": "optimistic",
        "transit_routing_preference": "fewer_transfers",
        "arrival_time": ARRIVAL_TIMESTAMP,
    },
    {
        "mode": "walking",
        "arrival_time": ARRIVAL_TIMESTAMP,
    },
]

gmaps = googlemaps.Client(key=os.environ["API_KEY"])

apartments_df = pandas.read_csv("apartments.tsv", delimiter="\t")
apartment_addresses = apartments_df.address.tolist()


def chunked(seq, size):
    return (seq[pos : pos + size] for pos in range(0, len(seq), size))


for i, poi in enumerate(POINTS_OF_INTEREST):
    distance = []
    duration = []
    fare = []
    for chunk in chunked(list(enumerate(apartment_addresses)), 25):
        distance_matrix_response = gmaps.distance_matrix(
            [address for _, address in chunk], poi, **TRANSIT_OPTS[i]
        )

        for j in range(len(chunk)):
            distance_matrix_row_element = distance_matrix_response["rows"][j][
                "elements"
            ][0]
            try:
                distance.append(distance_matrix_row_element["distance"]["value"])
            except KeyError:
                distance.append("N/A")
            try:
                duration.append(
                    float(distance_matrix_row_element["duration"]["value"]) / 60.0
                )
            except KeyError:
                # It's not a proper address or it's impossible to get to (i.e. for public transit, no bus)
                logging.warning(f"Missing directions from {chunk[j]} to {poi}")
                duration.append(MAX_DIRECTIONS_DURATION_MINS[i] + 1)
            try:
                fare.append(distance_matrix_row_element["fare"]["text"])
            except KeyError:
                fare.append("N/A")
        logging.info(f"Processed {chunk[j][0]+1}/{len(apartment_addresses)}")
    apartments_df[f"distance_{i}"] = distance
    apartments_df[f"duration_{i}"] = duration
    apartments_df[f"fare_{i}"] = fare


apartments_df["max_duration"] = apartments_df[
    [f"duration_{i}" for i in range(len(POINTS_OF_INTEREST))]
].max(axis=1)


query_operator = " & " if MAX_DIRECTIONS_DURATION_AND else " | "
apartments_df = apartments_df.query(
    query_operator.join(
        [
            f"duration_{i} <= {max_duration_to_poi}"
            for i, max_duration_to_poi in enumerate(MAX_DIRECTIONS_DURATION_MINS)
        ]
    )
)

apartments_df["min_duration"] = apartments_df[
    [f"duration_{i}" for i in range(len(POINTS_OF_INTEREST))]
].min(axis=1)
apartments_df["mean_duration"] = apartments_df[
    [f"duration_{i}" for i in range(len(POINTS_OF_INTEREST))]
].mean(axis=1)

logging.info(f"Filtered down from {len(apartment_addresses)} to {len(apartments_df)}")
apartments_df = apartments_df.sort_values(by="max_duration")
apartments_df.to_csv("apartments-with-distance.tsv", sep="\t", index=False)
