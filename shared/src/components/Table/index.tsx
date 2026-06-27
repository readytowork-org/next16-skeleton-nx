'use client';

import {
  Box,
  CircularProgress,
  Paper,
  styled,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  tooltipClasses,
  TooltipProps,
  Typography
} from '@mui/material';
import React, { Key, useEffect, useMemo, useState } from 'react';
import { ColumnType, TableProps } from './types';
import TablePagination from '../TablePagination';

import { useTranslations } from 'next-intl';
import NoDataCard from '../../atoms/NoDataCard';

function Table<Data extends object>({
  columns,
  isLoading = false,
  children,
  pagination,
  data = [],
  title
}: TableProps<Data>) {
  const t = useTranslations();
  const [isClient, setIsClient] = useState(false);
  const [order, setOrder] = useState<'asc' | 'desc' | undefined>(undefined);
  const [orderBy, setOrderBy] = useState<keyof Data | undefined>(undefined);

  useEffect(() => {
    // Standard SSR mount flag; safe to set once after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const handleSort = (columnId: keyof Data) => {
    const nextOrder =
      orderBy === columnId
        ? order === undefined
          ? 'asc'
          : order === 'asc'
            ? 'desc'
            : undefined
        : 'asc';

    setOrder(nextOrder);
    setOrderBy(nextOrder === undefined ? undefined : columnId);
  };

  // Memoized sorting logic
  const sortedData = useMemo(() => {
    if (order === undefined) return data;

    return Array.from<Data>(data).sort((a, b) => {
      if (!orderBy) return 0;

      const aValue = a[orderBy] ?? '';
      const bValue = b[orderBy] ?? '';

      // More robust comparison
      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return comparison * (order === 'asc' ? 1 : -1);
    });
  }, [data, orderBy, order]);

  const rowsPerPage = pagination?.rowsPerPage || 5;
  const currentPage = pagination?.page || 1;

  const getSortMessage = (columnId: ColumnType<Data>['id']) => {
    if (orderBy === columnId) {
      return order === 'asc'
        ? 'Click to sort descending'
        : order === 'desc'
          ? 'Click to cancel sorting'
          : 'Click to sort ascending';
    }
    return 'Click to sort ascending';
  };

  const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      backgroundColor: 'black',
      color: 'white',
      fontSize: theme.typography.pxToRem(14),
      padding: '6px 8px',
      borderRadius: 4
    },
    [`& .${tooltipClasses.arrow}`]: {
      color: 'black'
    }
  }));

  return (
    isClient && (
      <Paper
        sx={{
          width: '100%',
          borderRadius: '0',
          marginBottom: '20px',
          paddingBottom: '20px'
        }}
      >
        <TableContainer
          sx={{
            maxHeight: '80vh'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0px 20px',
              borderBottom: '1px solid #D1CFCF'
            }}
          >
            <Typography
              sx={{
                padding: '20px 0px',
                fontSize: '20px',
                fontWeight: 500,
                lineHeight: '28px',
                color: '#333645'
              }}
            >
              {title && t(title)}
            </Typography>
            <TablePagination
              rowsPerPage={rowsPerPage}
              count={pagination?.count || 0}
              page={currentPage}
              onPageChange={pagination?.onPageChange}
              padding={'10px 0px 0px 20px'}
            />
          </Box>
          <Box sx={{ padding: '20px' }}>
            <MuiTable stickyHeader>
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.id as Key}
                      align={column.align}
                      sx={{
                        minWidth: column.minWidth,
                        backgroundColor: '#596D84',
                        borderRight: '2px solid #B5B3CE'
                      }}
                      sortDirection={
                        orderBy === column.id && order !== undefined
                          ? order
                          : false
                      }
                    >
                      <TableSortLabel
                        IconComponent={() =>
                          !column.sortable ? (
                            <></>
                          ) : (
                            <CustomTooltip
                              arrow
                              enterDelay={300}
                              leaveDelay={300}
                              disableInteractive
                              title={getSortMessage(column.id)}
                              placement={'top'}
                            >
                              <Box
                                component={'img'}
                                src={
                                  orderBy === column.id
                                    ? order === 'asc'
                                      ? '/assets/icons/sort-asc.svg'
                                      : order === 'desc'
                                        ? '/assets/icons/sort-desc.svg'
                                        : '/assets/icons/sort.svg'
                                    : '/assets/icons/sort.svg'
                                }
                                alt={'sort icon'}
                                sx={{ width: 12, height: 20 }}
                              />
                            </CustomTooltip>
                          )
                        }
                        sx={{
                          pointerEvents: !column.sortable ? 'none' : 'auto',
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}
                        active={orderBy === column.id}
                        direction={
                          orderBy === column.id
                            ? order === undefined
                              ? undefined
                              : order
                            : undefined
                        }
                        onClick={() => handleSort(column.id as keyof Data)}
                      >
                        <Typography
                          sx={{ fontSize: 16, fontWeight: 500, color: '#fff' }}
                        >
                          {column.label}
                        </Typography>
                      </TableSortLabel>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell
                      height={250}
                      colSpan={columns.length}
                      align={'center'}
                    >
                      <CircularProgress />
                    </TableCell>
                  </TableRow>
                ) : (children ?? sortedData.length === 0) ? (
                  <TableRow>
                    <TableCell
                      height={250}
                      colSpan={columns.length}
                      align={'center'}
                    >
                      <NoDataCard />
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedData?.map((row, index) => (
                    <TableRow
                      hover
                      key={(row['id' as keyof Data] || index) as Key}
                      sx={{
                        backgroundColor:
                          index % 2 !== 0 ? '#F1F1F1' : 'transparent',
                        borderBottom: '1px solid #D2D1D173'
                      }}
                    >
                      {columns.map((column) => {
                        const value =
                          row[column.dataKey ?? (column.id as keyof Data)];
                        const getCell = () => {
                          if (column.render) {
                            return column.render(row);
                          }
                          return (
                            <Typography
                              sx={{
                                fontSize: 16,
                                fontWeight: 500,
                                color: '#4C4C4C'
                              }}
                              variant={'h6'}
                            >
                              {`${value}`}
                            </Typography>
                          );
                        };

                        return (
                          <TableCell
                            key={column.id as Key}
                            align={column.align}
                          >
                            {getCell()}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </MuiTable>
          </Box>
        </TableContainer>
        <TablePagination
          rowsPerPage={rowsPerPage}
          count={pagination?.count ?? -1}
          page={currentPage}
          onPageChange={pagination?.onPageChange}
        />
      </Paper>
    )
  );
}

export default Table;
