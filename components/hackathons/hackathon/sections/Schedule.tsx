'use client';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Divider } from '@/components/ui/divider';
import { SearchEventInput } from '@/components/ui/search-event-input';
import { TimeZoneSelect } from '@/components/ui/timezone-select';
import { HackathonHeader, ScheduleActivity } from '@/types/hackathons';
import {
  Link as LinkIcon,
  MapPin,
  CircleArrowRight,
  CircleArrowLeft,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Separator } from '@/components/ui/separator';
import DeadLine from '../DeadLine';
import { Button } from '@/components/ui/button';

function Schedule({ hackathon }: { hackathon: HackathonHeader }) {
  const [search, setSearch] = useState<string>('');
  const [timeZone, setTimeZone] = useState<string>('');
  const [selectedDay, setSelectedDay] = useState<string>('');

  useEffect(() => {
    if (hackathon.timezone) {
      setTimeZone(hackathon.timezone);
    }
    // Set initial selected day to the first day in schedule
    const groupedActivities = groupActivitiesByDay(hackathon.content.schedule);
    const firstDay = Object.keys(groupedActivities)[0];
    setSelectedDay(firstDay);
  }, [hackathon]);

  const defineTimeZone = (formatDateParams: any) => {
    if (timeZone) return { ...formatDateParams, timeZone: timeZone };
    return formatDateParams;
  };

  function getOrdinalSuffix(day: number): string {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:
        return 'st';
      case 2:
        return 'nd';
      case 3:
        return 'rd';
      default:
        return 'th';
    }
  }

  function getFormattedDay(date: Date) {
    const day = date.getDate();
    const suffix = getOrdinalSuffix(day);
    return `${day}${suffix} ${date.toLocaleString(
      'en-US',
      defineTimeZone({
        weekday: 'long',
      })
    )}`.toLocaleUpperCase();
  }

  function groupActivitiesByDay(
    activities: ScheduleActivity[]
  ): GroupedActivities {
    return activities.reduce((groups: GroupedActivities, activity) => {
      // Format the date to YYYY-MM-DD to use as key
      const date = new Date(activity.date);
      const dateKey = getFormattedDay(date);

      // If this date doesn't exist in groups, create an empty array
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }

      // Add the activity to the corresponding date group
      groups[dateKey].push(activity);

      // Sort activities within the day by time
      groups[dateKey].sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
        if (isNaN(dateA.getTime())) return 1;
        if (isNaN(dateB.getTime())) return -1;
        return dateA.getTime() - dateB.getTime();
      });

      return groups;
    }, {});
  }

  function getDateRange(activities: ScheduleActivity[]): string {
    if (!activities.length) return 'No dates available';

    const validDates = activities
      .map((activity) => new Date(activity.date))
      .filter((date) => !isNaN(date.getTime()));
    if (!validDates.length) return 'No valid dates available';

    const earliestDate = new Date(
      Math.min(...validDates.map((date) => date.getTime()))
    );
    const latestDate = new Date(
      Math.max(...validDates.map((date) => date.getTime()))
    );
    if (isNaN(earliestDate.getTime()) || isNaN(latestDate.getTime())) {
      return 'Invalid date range';
    }

    const formatter = new Intl.DateTimeFormat(
      'en-US',
      defineTimeZone({
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    );

    if (earliestDate.getTime() === latestDate.getTime()) {
      return formatter.format(earliestDate);
    }

    return `${formatter.format(earliestDate)} - ${formatter.format(
      latestDate
    )}`;
  }
  return (
    <section className='flex flex-col gap-6'>
      <h2
        className='text-4xl font-bold mb-2 md:text-4xl sm:text-3xl'
        id='schedule'
      >
        Schedule
      </h2>
      <Separator className='my-2 sm:my-8 bg-zinc-300 dark:bg-zinc-800' />
      <span className='dark:text-zinc-50 text-zinc-900 text-lg font-medium sm:text-base'>
        {getDateRange(hackathon.content.schedule)}
      </span>
      <div className='flex flex-col lg:flex-row justify-between gap-4 md:gap-10 mt-4 min-w-full'>
        <div className='flex flex-col md:flex-row items-start md:items-center justify-start lg:justify-center gap-4 md:gap-10 w-full md:w-auto'>
          <SearchEventInput setSearch={setSearch} />
          <TimeZoneSelect timeZone={timeZone} setTimeZone={setTimeZone} />
        </div>
        <DeadLine deadline={hackathon.content.submission_deadline} />
      </div>
      <Divider />
      <div className='bg-zinc-200 dark:bg-zinc-800 backdrop-blur-sm rounded-lg py-1 sm:w-fit w-full sm:max-w-none flex items-center gap-2'>
        <button
          onClick={() => {
            const days = Object.keys(groupActivitiesByDay(hackathon.content.schedule));
            const currentIndex = days.findIndex(day => day === selectedDay);
            if (currentIndex > 0) {
              setSelectedDay(days[currentIndex - 1]);
            }
          }}
          className='hidden sm:block text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 px-2 cursor-pointer min-w-[32px]'
        >
          <CircleArrowLeft strokeWidth={1} className='h-6 w-6 sm:h-8 sm:w-8' />
        </button>
        <div className='flex items-center overflow-x-auto no-scrollbar w-full sm:w-auto'>
          <div className='flex w-full sm:w-auto divide-x divide-zinc-300 dark:divide-zinc-700'>
            {Object.entries(groupActivitiesByDay(hackathon.content.schedule)).map(
              ([formattedDate, activities], index) => {
                if (!activities || activities.length === 0 || !activities[0]?.date) {
                  return null;
                }
                const date = new Date(activities[0].date);
                if (isNaN(date.getTime())) {
                  return null;
                }
                const month = date
                  .toLocaleString('en-US', { month: 'long' })
                  .toUpperCase();
                const day = date.getDate();
                return (
                  <div
                    key={index}
                    className={`border-none cursor-pointer transition-all select-none flex-1 sm:flex-initial ${
                      selectedDay === formattedDate
                        ? 'bg-zinc-500 text-white dark:bg-black dark:text-white'
                        : 'bg-transparent text-zinc-600 hover:text-zinc-800 dark:text-zinc-500 dark:hover:text-zinc-300'
                    } rounded-lg whitespace-nowrap`}
                    onClick={() => setSelectedDay(formattedDate)}
                  >
                    <div className='flex items-center justify-center gap-1 py-1.5 px-2 sm:px-3'>
                      {month && <span className='text-xs sm:text-sm font-medium'>{month}</span>}
                      {day && <span className='text-xs sm:text-sm font-medium'>{day}</span>}
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
        <button
          onClick={() => {
            const days = Object.keys(groupActivitiesByDay(hackathon.content.schedule));
            const currentIndex = days.findIndex(day => day === selectedDay);
            if (currentIndex < days.length - 1) {
              setSelectedDay(days[currentIndex + 1]);
            }
          }}
          className='hidden sm:block text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-300 px-2 cursor-pointer min-w-[32px]'
        >
          <CircleArrowRight strokeWidth={1} className='h-6 w-6 sm:h-8 sm:w-8' />
        </button>
      </div>
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-5'>
        {Object.entries(groupActivitiesByDay(hackathon.content.schedule))
          .filter(([date], index, array) => {
            const selectedIndex = array.findIndex(([d]) => d === selectedDay);
            return index === selectedIndex || index === selectedIndex + 1;
          })
          .map(([formattedGroupDate, activities], index) => {
            const now = new Date();
            const nowFormattedDay = getFormattedDay(now);
            const dateIsCurrentDate = formattedGroupDate == nowFormattedDay;
            return (
              <div key={index} className='flex flex-col gap-4'>
                <h3
                  className={`text-2xl text-center p-4 rounded-md text-zinc-900 font-black mb-4 ${
                    dateIsCurrentDate ? 'bg-red-500' : 'bg-red-300'
                  } sm:text-xl`}
                >
                  {formattedGroupDate}
                </h3>

                {activities
                  .filter((activity) => {
                    const searchLower = search.toLowerCase();
                    return (
                      !search ||
                      activity.name?.toLowerCase().includes(searchLower) ||
                      activity.category?.toLowerCase().includes(searchLower) ||
                      activity.location
                        ?.toLocaleLowerCase()
                        .includes(searchLower)
                    );
                  })
                  .map((activity, index) => {
                    const startDate = new Date(activity.date);
                    const endDate = new Date(
                      new Date(activity.date).getTime() +
                        (Number(activity.duration) || 0) * 60000
                    );
                    const activityIsOcurring =
                      startDate <= now && now <= endDate;
                    const voidHost =
                      !activity.host_icon &&
                      !activity.host_name &&
                      !activity.host_media;
                    return (
                      <div
                        key={index}
                        className='flex flex-col sm:flex-row gap-3 sm:h-[220px] md:h-[180px]'
                      >
                        <Card
                          className={`${
                            dateIsCurrentDate
                              ? 'bg-zinc-100 dark:!bg-zinc-900'
                              : 'bg-zinc-50 dark:!bg-zinc-950'
                          } ${
                            activityIsOcurring && dateIsCurrentDate
                              ? 'border-2 dark:border-red-500 border-red-500'
                              : dateIsCurrentDate
                              ? 'dark:!border-zinc-900 border-zinc-400'
                              : 'dark:!border-zinc-800 border-zinc-300'
                          } px-2 sm:px-4 sm:w-[40%] md:w-[173px] rounded-lg`}
                        >
                          <CardContent className='h-full relative flex flex-col gap-2 justify-center items-center p-2 sm:p-6'>
                            <div className='absolute top-0'>
                              {activityIsOcurring && dateIsCurrentDate && (
                                <div className='border border-red-500 rounded-full text-xs font-medium text-center w-1/3 sm:w-auto sm:px-2'>
                                  Live now
                                </div>
                              )}
                              {!activityIsOcurring && dateIsCurrentDate && (
                                <div className='border dark:bg-zinc-800 bg-zinc-300 flex items-center justify-center gap-1 rounded-full text-xs font-medium text-center w-1/3 sm:w-auto sm:px-3 py-1 border-none'>
                                  <LinkIcon
                                    size={16}
                                    className='!text-zinc-900 dark:!text-zinc-50'
                                  />
                                  Zoom
                                </div>
                              )}
                            </div>
                            <div className='flex flex-col items-center justify-center h-full'>
                              <span className='text-base md:text-lg font-medium'>
                                {startDate.toLocaleTimeString(
                                  'en-US',
                                  defineTimeZone({
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })
                                )}
                              </span>
                              <span className='text-base md:text-lg font-medium'>
                                {endDate.toLocaleTimeString(
                                  'en-US',
                                  defineTimeZone({
                                    hour: '2-digit',
                                    minute: '2-digit',
                                    hour12: true,
                                  })
                                )}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                        <Card
                          className={`${
                            dateIsCurrentDate
                              ? 'dark:!bg-zinc-900 bg-zinc-100'
                              : 'dark:!bg-zinc-950 bg-zinc-50'
                          } border ${
                            activityIsOcurring && dateIsCurrentDate
                              ? 'border-2 dark:border-red-500 border-red-500'
                              : dateIsCurrentDate
                              ? 'dark:!border-zinc-900 border-zinc-400'
                              : 'dark:!border-zinc-800 border-zinc-300'
                          } sm:w-[60%] md:flex-1 rounded-lg`}
                        >
                          <CardContent
                            className={`h-full flex flex-col ${
                              voidHost ? 'justify-start' : 'justify-between'
                            } gap-2`}
                          >
                            <div>
                              <div className='flex justify-between items-center'>
                                <CardTitle className='text-red-500 text-lg sm:text-base'>
                                  {activity.name || 'Untitled Activity'}
                                </CardTitle>
                                {activity.category && (
                                  <Badge className='bg-zinc-600 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900 py-0.5 px-2.5 text-xs rounded-xl'>
                                    {activity.category}
                                  </Badge>
                                )}
                              </div>
                              {activity.description && (
                                <span className='dark:text-zinc-400 text-zinc-600 text-s sm:text-sm font-normal'>
                                  {activity.description}
                                </span>
                              )}
                            </div>
                            {!voidHost && (
                              <div className='flex flex-row items-center gap-4'>
                                {activity.host_icon && (
                                  <Image
                                    src={activity.host_icon}
                                    alt={activity.host_name || 'Host'}
                                    width={40}
                                    height={40}
                                    className='min-w-[40px]'
                                  />
                                )}
                                <div className='flex flex-col'>
                                  {activity.host_name && (
                                    <span className='text-sm sm:text-base'>
                                      {activity.host_name}
                                    </span>
                                  )}
                                  {activity.host_media && (
                                    <Link
                                      className='dark:text-zinc-400 text-zinc-600 text-s sm:text-sm font-normal'
                                      href={`https://x.com/${activity.host_media}`}
                                      target='_blank'
                                    >
                                      @{activity.host_media}
                                    </Link>
                                  )}
                                </div>
                              </div>
                            )}
                            <div
                              className={`flex flex-row sm:gap-4 ${
                                voidHost
                                  ? 'flex-1 items-center'
                                  : 'justify-between'
                              }`}
                            >
                              <div className='flex flex-row items-center gap-2'>
                                <MapPin color='#8F8F99' className='w-5 h-5' />
                                <span className='dark:text-zinc-50 zinc-900 sm:text-sm font-normal'>
                                  {activity.location}
                                </span>
                              </div>
                              {/* <Button
                                  variant="secondary"
                                  size="icon"
                                  className="bg-zinc-300 dark:bg-zinc-800 w-8 sm:w-10 min-w-8 sm:min-w-10 h-8 sm:h-10"
                                >
                                  <CalendarPlus2 className="w-3 h-3 sm:w-4 sm:h-4 !text-zinc-900 dark:!text-zinc-50" />
                                </Button> */}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </section>
  );
}

export default Schedule;

type GroupedActivities = {
  [key: string]: ScheduleActivity[];
};
