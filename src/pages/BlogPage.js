import { Helmet } from 'react-helmet-async';
import axios from 'axios';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useEffect } from 'react';
import './css/blogs.css'
import { FaX } from "react-icons/fa6";
// @mui
import {
  Card,
  Table,
  Stack,
  Paper,
  Avatar,
  Popover,
  Checkbox,
  TableRow,
  MenuItem,
  TableBody,
  TableCell,
  Container,
  Typography,
  IconButton,
  TableContainer,
  TablePagination,
  Button
} from '@mui/material';
// components
import Label from '../components/label';
import Iconify from '../components/iconify';
import Scrollbar from '../components/scrollbar';
// sections
import { UserListHead } from '../sections/@dashboard/user';

const TABLE_HEAD = [
  { id: 'title', label: 'Tiêu đề', alignRight: false },
  { id: 'content', label: 'Mô tả', alignRight: false },
  { id: '', label: 'Hoạt động', alignRight: false }
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function ProductsPage() {
  const [open, setOpen] = useState(null);
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);

  const [order, setOrder] = useState('asc');

  const [selected, setSelected] = useState([]);

  const [orderBy, setOrderBy] = useState('name');

  const [filterName, setFilterName] = useState('');

  const [rowsPerPage, setRowsPerPage] = useState(5);


  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };



  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = blogs.map((blog) => blog.title);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setPage(0);
    setRowsPerPage(parseInt(event.target.value, 10));
  };


  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - blogs.length) : 0;

  const filteredUsers = applySortFilter(blogs, getComparator(order, orderBy), filterName);

  const isNotFound = !filteredUsers.length && !!filterName;




  useEffect(() => {
    axios.get('http://localhost:5000/get-blogs')
      .then((response) => {
        const blogsData = response.data.blogs;
        setBlogs(blogsData);
      })
      .catch((error) => {
        console.error('Lỗi:', error);
      });
  }, []);

  // Form thêm bài viết
  const [showForm, setShowForm] = useState(false);

  const handleOpenForm = () => {
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
  };
  return (
    <div>
      <Helmet>
        <title> Quản Lý Bài Viết </title>
      </Helmet>
        {showForm && (
      <div className="overlay__blogs">
        <h1>Thêm Bài Viết</h1>
        <button className='close__blogs' onClick={handleCloseForm}>
          <i><FaX/></i>
        </button>
        <form className='form'>
          <div className='form__label'>
            <p className='form__label-text'>
              Tiêu đề
            </p>
            <input
              type="text"
              placeholder='Nhập Tiêu Đề'
            />
          </div>
          <div className='form__label'>
            <p className='form__label-text'>
              Hình ảnh
            </p>
            <input
              type="file"
            />
          </div>
          <div className='form__label'>
            <p className='form__label-text'>
              Nội dung
            </p>
            <input
              placeholder='Nhập Nội Dung'
              type="text"
            />
          </div>
          <button className='form__button-blogs' type="submit">Thêm Bài Viết</button>
        </form>
      </div>
        )}

      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Quản Lý Bài Viết
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenForm}>
            Thêm Bài Viết
          </Button>
        </Stack>

        <Card>
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={blogs.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, title, content, imageBlog } = row;
                    const selectedUser = selected.indexOf(title) !== -1;

                    return (
                      <TableRow hover key={id} tabIndex={-1} role="checkbox" selected={selectedUser}>
                        <TableCell padding="checkbox">
                          <Checkbox checked={selectedUser} onChange={(event) => handleClick(event, title)} />
                        </TableCell>

                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Avatar alt={title} src={imageBlog} />
                            <Typography variant="subtitle2" noWrap>
                              {title}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{content}</TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="right" spacing={2}>
                          <MenuItem>
                            <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
                            Edit
                          </MenuItem>

                          <MenuItem sx={{ color: 'error.main' }} variant="subtitle2" noWrap>
                            <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
                            Banned
                          </MenuItem>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <Paper
                          sx={{
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="h6" paragraph>
                            Not found
                          </Typography>

                          <Typography variant="body2">
                            No results found for &nbsp;
                            <strong>&quot;{filterName}&quot;</strong>.
                            <br /> Try checking for typos or using complete words.
                          </Typography>
                        </Paper>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
          </Scrollbar>

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={blogs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Card>
      </Container>

      <Popover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            p: 1,
            width: 140,
            '& .MuiMenuItem-root': {
              px: 1,
              typography: 'body2',
              borderRadius: 0.75,
            },
          },
        }}
      >
        {/* <MenuItem>
          <Iconify icon={'eva:edit-fill'} sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem sx={{ color: 'error.main' }}>
          <Iconify icon={'eva:trash-2-outline'} sx={{ mr: 2 }} />
          Banned
        </MenuItem> */}
      </Popover>
    </div>
  );
}
