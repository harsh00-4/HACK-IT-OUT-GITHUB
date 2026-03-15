/**
 * Official data source for this dashboard: CESM CVDP Data Repository (NCAR/UCAR).
 * All climate netCDF data used here can be obtained from this repository.
 * @see https://www.cesm.ucar.edu/projects/cvdp/data-repository
 */

export const CESM_CVDP_DATA_REPOSITORY_URL = "https://www.cesm.ucar.edu/projects/cvdp/data-repository";

/** Example direct links to Data (tar) files from the repository. Extract tar to get .nc files. */
export const CESM_EXAMPLE_DATASETS: { label: string; url: string }[] = [
  {
    label: "CESM2 Large Ensemble 1850-2100",
    url: "http://webext.cgd.ucar.edu/Multi-Case/CVDP%5Frepository/cesm2-lens%5Fquadquad%5F1850-2100/cesm2-lens%5Fquadquad%5F1850-2100.cvdp%5Fdata.tar",
  },
  {
    label: "CMIP6 historical + SSP1-2.6 (1900-2100)",
    url: "http://webext.cgd.ucar.edu/Multi-Case/CVDP%5Frepository/cmip6.hist%5Fssp126%5Fquadquad%5F1900-2100/cmip6.hist%5Fssp126%5Fquadquad%5F1900-2100.cvdp%5Fdata.tar",
  },
  {
    label: "CESM1/2 Large Ensembles 1950-2024",
    url: "http://webext.cgd.ucar.edu/Multi-Case/CVDP%5Frepository/cesm-lens%5Fquadquad%5F1950-2024/cesm-lens%5Fquadquad%5F1950-2024.cvdp%5Fdata.tar",
  },
];
