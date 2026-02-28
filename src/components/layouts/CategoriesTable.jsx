"use client";

import { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setTablePagination } from "@/features/SettingsSlice";
import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Typography,
  Chip,
  Box,
  Checkbox,
  TextField,
  TablePagination,
  Select,
  MenuItem,
  InputAdornment,
  Button,
} from "@mui/material";
import CategoryService from "@/services/CategoryService";
import { useLoading } from "@/providers/LoadingProvider";
import { HiSearch, HiPencil, HiTrash, HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useNotification } from "@/providers/NotificationProvider";

export const mockCategories = [];

export default function CategoriesTable({
  filterLevel,
  filterParent,
  onFilterChange,
}) {
  const [categories, setCategories] = useState([]);
  const [allCategories, setAllCategories] = useState([]); // For filters
  const [totalCount, setTotalCount] = useState(0);
  const [selected, setSelected] = useState([]);
  const dispatch = useDispatch();
  const tableSettings = useSelector(
    (s) => s.settings?.tables?.categories || {}
  );
  const page = tableSettings.page ?? 0;
  const rowsPerPage = tableSettings.rowsPerPage ?? 10; // Default to 10 for better UX
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const router = useRouter();
  const { showNotification } = useNotification();
  const { showLoader, hideLoader } = useLoading();

  const [sort, setSort] = useState("name_asc");

  // Sorting and filtering
  const filteredCategories = useMemo(() => {
    const result = [...categories];
    result.sort((a, b) => {
      switch (sort) {
        case "name_asc":
          return (a.name || "").localeCompare(b.name || "");
        case "name_desc":
          return (b.name || "").localeCompare(a.name || "");
        case "products_desc":
          return (
            (b.statistics?.totalProducts || 0) -
            (a.statistics?.totalProducts || 0)
          );
        case "products_asc":
          return (
            (a.statistics?.totalProducts || 0) -
            (b.statistics?.totalProducts || 0)
          );
        case "subcats_desc":
          return (
            (b.statistics?.totalSubcategories || 0) -
            (a.statistics?.totalSubcategories || 0)
          );
        case "subcats_asc":
          return (
            (a.statistics?.totalSubcategories || 0) -
            (b.statistics?.totalSubcategories || 0)
          );
        default:
          return 0;
      }
    });
    return result;
  }, [categories, sort]);

  // Fetch categories directly from API
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      showLoader();
      try {
        const response = await CategoryService.getCategories({
          page: page + 1,
          limit: rowsPerPage,
          search,
          level: levelFilter,
          parent: parentFilter,
          sort,
        });

        // Log response for debugging pagination
        if (process.env.NODE_ENV === "development") {
          console.log("[CategoriesTable] API Response:", response);
        }


        const payload = response ?? {};
        const categoriesResult =
          payload.data ??
          payload.categories ??
          (Array.isArray(payload) ? payload : []);

        // More robust total count extraction
        const total =
          payload.pagination?.totalItems ??
          payload.pagination?.total ??
          payload.totalCount ??
          payload.total ??
          payload.count ??
          (Array.isArray(categoriesResult) ? categoriesResult.length : 0);

        setCategories(categoriesResult);
        setTotalCount(total);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        setCategories([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
        hideLoader();
      }
    };

    fetchCategories();
  }, [page, rowsPerPage, search, levelFilter, parentFilter, sort]);

  // Fetch all categories once for the parent filter dropdown
  useEffect(() => {
    const fetchAllCategories = async () => {
      try {
        const response = await CategoryService.getCategories({
          limit: 1000, // Large limit to get mostly everything for filters
        });
        const payload = response?.data ?? response ?? {};
        const all = payload.categories ?? payload.data ?? (Array.isArray(payload) ? payload : []);
        setAllCategories(all);
      } catch (error) {
        console.error("Failed to fetch all categories for filters:", error);
      }
    };
    fetchAllCategories();
  }, []);

  // Sync external filter props
  useEffect(() => {
    if (filterLevel !== undefined) setLevelFilter(filterLevel);
    if (filterParent !== undefined) setParentFilter(filterParent);
  }, [filterLevel, filterParent]);

  // Sync filters to Redux
  useEffect(() => {
    try {
      dispatch({
        type: "settings/setTableFilters",
        payload: {
          tableId: "categories",
          filters: { search, level: levelFilter, parent: parentFilter, sort },
        },
      });
    } catch (e) {
      console.error("Failed to sync category filters:", e);
    }
  }, [search, levelFilter, parentFilter, sort]);

  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    dispatch(setTablePagination({ tableId: "categories", page: newPage }));
  };

  const handleChangeRowsPerPage = (event) => {
    const newRows = parseInt(event.target.value, 10);
    dispatch(
      setTablePagination({ tableId: "categories", rowsPerPage: newRows, page: 0 })
    );
  };

  // Initialize table settings if not present
  useEffect(() => {
    if (!tableSettings.rowsPerPage) {
      dispatch(
        setTablePagination({
          tableId: "categories",
          rowsPerPage: 10,
          page: 0,
        })
      );
    }
  }, []);

  // Row selection handlers
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      const allIds = filteredCategories.map((cat) => cat.id);
      setSelected(allIds);
    } else {
      setSelected([]);
    }
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // Edit / Delete actions
  const handleEdit = (slug) => {
    router.push(`/admin/categories/edit/${slug}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this category?"))
      return;
    showLoader();
    try {
      await CategoryService.deleteCategory(id);
      showNotification("Category deleted successfully!", "success");
      // Refetch categories after deletion
      const response = await CategoryService.getCategories({
        page: page + 1,
        limit: rowsPerPage,
        search,
        level: levelFilter,
        parent: parentFilter,
        sort,
      });
      const payload = response?.data ?? response ?? {};
      const categoriesResult =
        payload.categories ??
        payload.data ??
        (Array.isArray(payload) ? payload : []);
      const total =
        payload.totalCount ??
        payload.total ??
        (Array.isArray(categoriesResult) ? categoriesResult.length : 0);
      setCategories(categoriesResult);
      setTotalCount(total);
    } catch (error) {
      console.error("Failed to delete category:", error);
      showNotification("Failed to delete category.", "error");
    } finally {
      hideLoader();
    }
  };

  const getUniqueParents = () => {
    // Collect unique parent names or IDs from all categories
    const parents = allCategories
      .map((c) => c.parentCategory?.name || c.parentCategory || c.parent)
      .filter(Boolean);
    return [...new Set(parents)].sort();
  };

  return (
    <>
      <Card
        sx={{
          borderRadius: 0,
          boxShadow: "0 2px 10px rgba(0,0,0,0.01)",
          border: "none",
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2.5}
          py={1.5}
          sx={{ borderBottom: "1px solid #e5e7eb" }}
        >
          <Typography variant="h6" fontWeight={600}>
            Categories
          </Typography>
          <Link href="/admin/categories/new" passHref>
            <Button variant="contained" startIcon={<HiPlus />}>
              Add Category
            </Button>
          </Link>
        </Box>

        {/* Controls */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2.5}
          py={1.5}
          gap={2}
          flexWrap="wrap"
        >
          <TextField
            placeholder="Search categories..."
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flex: 1, minWidth: 240 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {" "}
                  <HiSearch size={18} />{" "}
                </InputAdornment>
              ),
            }}
          />

          <Select
            size="small"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            displayEmpty
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="name_asc">Name (A-Z)</MenuItem>
            <MenuItem value="name_desc">Name (Z-A)</MenuItem>
            <MenuItem value="products_desc">Products (High-Low)</MenuItem>
            <MenuItem value="products_asc">Products (Low-High)</MenuItem>
            <MenuItem value="subcats_desc">Subcats (High-Low)</MenuItem>
            <MenuItem value="subcats_asc">Subcats (Low-High)</MenuItem>
          </Select>

          <Select
            size="small"
            value={levelFilter}
            onChange={(e) => {
              const v = e.target.value;
              setLevelFilter(v);
              if (onFilterChange)
                onFilterChange({ level: v, parent: parentFilter });
            }}
            displayEmpty
            sx={{ minWidth: 120 }}
          >
            <MenuItem value="">All Levels</MenuItem>
            <MenuItem value={1}>Level 1</MenuItem>
            <MenuItem value={2}>Level 2</MenuItem>
            <MenuItem value={3}>Level 3</MenuItem>
          </Select>

          <Select
            size="small"
            value={parentFilter}
            onChange={(e) => {
              const p = e.target.value;
              setParentFilter(p);
              if (onFilterChange)
                onFilterChange({ level: levelFilter, parent: p });
            }}
            displayEmpty
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All Parents</MenuItem>
            {getUniqueParents().map((p) => (
              <MenuItem key={p} value={p}>
                {p}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* Table */}
        <Box sx={{ overflowX: "auto", width: "100%" }}>
          <TableContainer sx={{ minWidth: 900 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#f9fafb" }}>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={
                        selected.length > 0 &&
                        selected.length < filteredCategories.length
                      }
                      checked={
                        filteredCategories.length > 0 &&
                        selected.length === filteredCategories.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Slug</TableCell>
                  <TableCell>Level</TableCell>
                  <TableCell>Parent</TableCell>
                  <TableCell>Products</TableCell>
                  <TableCell>Subcategories</TableCell>
                  <TableCell>Attributes</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCategories.map((cat) => (
                  <TableRow
                    key={cat.id}
                    hover
                    selected={selected.includes(cat.id)}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selected.includes(cat.id)}
                        onChange={() => handleSelectRow(cat.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1.5}>
                        <Avatar
                          alt={cat.name}
                          src={cat.image?.url}
                          sx={{ width: 36, height: 36 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            {cat.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {cat.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{cat.slug}</TableCell>
                    <TableCell>{cat.level}</TableCell>
                    <TableCell>{cat.parent || "-"}</TableCell>
                    <TableCell>{cat.statistics?.totalProducts ?? 0}</TableCell>
                    <TableCell>
                      {cat.statistics?.totalSubcategories ?? 0}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={`${cat.attributes?.length ?? 0}`}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center" sx={{ position: "relative" }}>
                      <Tooltip title="Edit">
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(cat.slug)}
                        >
                          <HiPencil />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(cat.id)}
                        >
                          <HiTrash style={{ color: "#dc2626" }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        {/* Bottom controls */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          px={2}
          py={1.5}
          sx={{ borderTop: "1px solid #e5e7eb", backgroundColor: "#f3f3f3ff" }}
        >
          <Typography variant="body2" color="text.secondary">
            {totalCount} categories
          </Typography>
          <TablePagination
            component="div"
            count={totalCount}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50, 100]}
          />
        </Box>
      </Card>
    </>
  );
}
