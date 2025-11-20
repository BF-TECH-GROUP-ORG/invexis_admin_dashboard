"use client";

import { useState, useMemo, useEffect } from "react";
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
import { HiSearch, HiPencil, HiTrash, HiPlus } from "react-icons/hi";
import { useRouter } from "next/navigation";

export const mockCategories = [
  {
    id: "cat_1",
    name: "Grocery & Gourmet Food",
    slug: "grocery-gourmet-food-biryoshye",
    description: "Fresh and gourmet food items, snacks, and beverages.",
    level: 1,
    parent: null,
    image: {
      url: "https://thumbs.dreamstime.com/b/grocery-store-banner-food-drinks-label-vector-illustration-91752092.jpg",
      alt: "Grocery and gourmet food category banner",
    },
    seo: {
      metaTitle: "Grocery & Gourmet Food - Fresh & Delicacies",
      metaDescription: "Daily essentials and premium gourmet selections.",
      keywords: ["grocery", "food", "snacks", "beverages", "gourmet"],
    },
    attributes: [
      {
        name: "Dietary",
        type: "multiselect",
        options: ["Vegan", "Gluten-Free", "Organic"],
      },
      {
        name: "Type",
        type: "select",
        options: ["Fresh", "Packaged", "Frozen"],
      },
    ],
    statistics: { totalProducts: 0, totalSubcategories: 1 },
  },
  {
    id: "cat_2",
    name: "Footwear",
    slug: "footwear",
    description: "Shoes, boots, and sandals for all seasons.",
    level: 2,
    parent: "Grocery & Gourmet Food",
    image: {
      url: "https://example.com/footwear.jpg",
      alt: "Footwear subcategory banner",
    },
    seo: {
      metaTitle: "Footwear - Shoes, Boots & Sandals",
      metaDescription: "Comfortable footwear for men and women.",
      keywords: ["shoes", "boots", "sandals", "sneakers"],
    },
    attributes: [
      { name: "Size", type: "select", options: ["6", "7", "8", "9"] },
    ],
    statistics: { totalProducts: 0, totalSubcategories: 1 },
  },
  {
    id: "cat_3",
    name: "Sandals",
    slug: "sandals",
    description: "Open-toed footwear for summer.",
    level: 3,
    parent: "Footwear",
    image: {
      url: "https://example.com/sandals.jpg",
      alt: "Sandals subcategory banner",
    },
    seo: {
      metaTitle: "Sandals - Summer Open-Toed Shoes",
      metaDescription: "Flip-flops and strappy sandals.",
      keywords: ["sandals", "flip-flops", "strappy"],
    },
    attributes: [
      {
        name: "Style",
        type: "select",
        options: ["Flip-Flop", "Strappy", "Wedge"],
      },
    ],
    statistics: { totalProducts: 0, totalSubcategories: 0 },
  },
];

export default function CategoriesTable({
  filterLevel,
  filterParent,
  onFilterChange,
}) {
  const [categories, setCategories] = useState(mockCategories);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [parentFilter, setParentFilter] = useState("");
  const [openMenu, setOpenMenu] = useState(null);
  const router = useRouter();

  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.slug.toLowerCase().includes(search.toLowerCase()) ||
        (c.description || "").toLowerCase().includes(search.toLowerCase());
      const matchesLevel =
        !levelFilter || String(c.level) === String(levelFilter);
      const matchesParent = !parentFilter || (c.parent || "") === parentFilter;
      return matchesSearch && matchesLevel && matchesParent;
    });
  }, [categories, search, levelFilter, parentFilter]);

  const handleSelectAll = (e) => {
    if (e.target.checked) setSelected(filteredCategories.map((c) => c.id));
    else setSelected([]);
  };

  const handleSelectRow = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const getUniqueParents = () => {
    return [...new Set(categories.map((c) => c.parent).filter(Boolean))].sort();
  };

  // Sync external filters (from analytics cards) with internal select controls
  useEffect(() => {
    if (filterLevel !== undefined) setLevelFilter(filterLevel || "");
  }, [filterLevel]);

  useEffect(() => {
    if (filterParent !== undefined) setParentFilter(filterParent || "");
  }, [filterParent]);

  const handleEdit = (slug) => {
    router.push(`/categories/edit/${slug}`);
    setOpenMenu(null);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this category?"))
      setCategories((prev) => prev.filter((c) => c.id !== id));
    setOpenMenu(null);
  };

  const handleAdd = () => router.push("/categories/new");

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
          alignItems="center"
          justifyContent="space-between"
          px={2.5}
          py={1.5}
        >
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ color: "#081422" }}>
              Categories
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Manage product categories and their attributes
            </Typography>
          </Box>

          <Box>
            <Button
              startIcon={<HiPlus />}
              variant="contained"
              onClick={handleAdd}
              sx={{ backgroundColor: "#081422" }}
            >
              Add Category
            </Button>
          </Box>
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
                {filteredCategories
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((cat) => (
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
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {cat.description}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>

                      <TableCell>{cat.slug}</TableCell>
                      <TableCell>{cat.level}</TableCell>
                      <TableCell>{cat.parent || "-"}</TableCell>
                      <TableCell>
                        {cat.statistics?.totalProducts ?? 0}
                      </TableCell>
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
            {filteredCategories.length} categories
          </Typography>

          <TablePagination
            component="div"
            count={filteredCategories.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
          />
        </Box>
      </Card>
    </>
  );
}
