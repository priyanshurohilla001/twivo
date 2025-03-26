import React, { useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const BreadcrumbDash = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Generate breadcrumb items based on current path
  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname
      .split("/")
      .filter((segment) => segment);
    const items = [];

    // Always add Dashboard as the first item
    items.push({
      label: "Dashboard",
      path: "/dashboard",
      isCurrent: pathSegments.length === 1 && pathSegments[0] === "dashboard",
    });

    // Add additional path segments
    if (pathSegments.length > 1 && pathSegments[0] === "dashboard") {
      for (let i = 1; i < pathSegments.length; i++) {
        const segment = pathSegments[i];
        const path = `/${pathSegments.slice(0, i + 1).join("/")}`;

        // Format the segment name to be more user-friendly
        const label = segment.charAt(0).toUpperCase() + segment.slice(1);

        items.push({
          label,
          path,
          isCurrent: i === pathSegments.length - 1,
        });
      }
    }

    return items;
  }, [location.pathname]);

  const handleNavigation = (e, path) => {
    e.preventDefault();
    navigate(path);
  };

  return (
    <Breadcrumb aria-label="Breadcrumb navigation">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {item.isCurrent ? (
                <BreadcrumbPage aria-current="page">
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  href={item.path}
                  onClick={(e) => handleNavigation(e, item.path)}
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default React.memo(BreadcrumbDash);
