"use client";
import PropTypes from "prop-types";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

const TreeContext = createContext(null);

const useTree = () => {
  const context = useContext(TreeContext);
  if (!context) {
    throw new Error("useTree must be used within a TreeProvider");
  }
  return context;
};

const Tree = forwardRef((
  {
    className,
    elements,
    initialSelectedId,
    initialExpandedItems,
    defaultExpanded = false,
    children,
    indicator = true,
    openIcon,
    closeIcon,
    dir,
    ...props
  },
  ref,
) => {
  const [selectedId, setSelectedId] = useState(initialSelectedId);
  const [expandedItems, setExpandedItems] = useState(initialExpandedItems || []);

  const expendAllTree = useCallback((elements) => {
    if (!elements) return;
    elements.forEach((element) => {
      setExpandedItems((prev) => [...(prev ?? []), element.id]);
      if (element.children) {
        expendAllTree(element.children);
      }
    });
  }, [setExpandedItems]);

  useEffect(() => {
    if (initialExpandedItems) {
      setExpandedItems(initialExpandedItems);
    } else if (defaultExpanded) {
      // If defaultExpanded is true, expand all items by default
      expendAllTree(elements);
    }
  }, [initialExpandedItems, defaultExpanded, elements, expendAllTree]);

  const selectItem = useCallback((id) => {
    setSelectedId(id);
  }, []);

  const handleExpand = useCallback((id) => {
    setExpandedItems((prev) => {
      if (prev?.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return [...(prev ?? []), id];
    });
  }, []);

  const expandSpecificTargetedElements = useCallback((elements, selectId) => {
    if (!elements || !selectId) return;
    const findParent = (
      currentElement,
      currentPath = [],
    ) => {
      const isSelectable = currentElement.isSelectable ?? true;
      const newPath = [...currentPath, currentElement.id];
      if (currentElement.id === selectId) {
        if (isSelectable) {
          setExpandedItems((prev) => [...(prev ?? []), ...newPath]);
        } else {
          if (newPath.includes(currentElement.id)) {
            newPath.pop();
            setExpandedItems((prev) => [...(prev ?? []), ...newPath]);
          }
        }
        return;
      }
      if (
        isSelectable &&
        currentElement.children &&
        currentElement.children.length > 0
      ) {
        currentElement.children.forEach((child) => {
          findParent(child, newPath);
        });
      }
    };
    elements.forEach((element) => {
      findParent(element);
    });
  }, []);

  useEffect(() => {
    if (initialSelectedId) {
      expandSpecificTargetedElements(elements, initialSelectedId);
    }
  }, [initialSelectedId, elements, expandSpecificTargetedElements]);

  const direction = dir === "rtl" ? "rtl" : "ltr";

  return (
    (<TreeContext.Provider
      value={{
        selectedId,
        expandedItems,
        handleExpand,
        selectItem,
        setExpandedItems,
        indicator,
        openIcon,
        closeIcon,
        direction,
      }}>
      <div className={cn("size-full", className)}>
        <ScrollArea ref={ref} className="relative h-full pr-1" dir={dir}>
          <AccordionPrimitive.Root
            {...props}
            type="multiple"
            defaultValue={expandedItems}
            value={expandedItems}
            className="flex flex-col gap-1"
            onValueChange={(value) =>
              setExpandedItems((prev) => [...(prev ?? []), value[0]])
            }
            dir={dir}>
            {children}
          </AccordionPrimitive.Root>
        </ScrollArea>
      </div>
    </TreeContext.Provider>)
  );
});

Tree.propTypes = {
  elements: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      children: PropTypes.array
    })
  ),
  initialSelectedId: PropTypes.string,
  initialExpandedItems: PropTypes.arrayOf(PropTypes.string),
  defaultExpanded: PropTypes.bool,
  children: PropTypes.node,
  indicator: PropTypes.bool,
  openIcon: PropTypes.node,
  closeIcon: PropTypes.node,
  dir: PropTypes.string,
  className: PropTypes.string
};

Tree.displayName = "Tree";

const TreeIndicator = forwardRef(function TreeIndicator({ className, ...props }, ref) {
  const { direction } = useTree();

  return (
    <div
      dir={direction}
      ref={ref}
      className={cn(
        "absolute left-3 h-[calc(100%-8px)] w-0.5 rounded-md bg-gray-300 my-1 duration-300 ease-in-out hover:bg-gray-400 rtl:right-3",
        className
      )}
      {...props} />
  );
});

TreeIndicator.propTypes = {
  className: PropTypes.string
};

TreeIndicator.displayName = "TreeIndicator";

const Folder = forwardRef(function Folder(
  {
    className,
    element,
    value,
    isSelectable = true,
    isSelect,
    onSelect,
    children,
    ...props
  },
  ref
) {
  const handleClick = (e) => {
    if (!isSelectable) return;
    e.preventDefault();
    if (onSelect) onSelect();
  };

  return (
    <AccordionPrimitive.Item {...props} ref={ref} value={value} className="relative h-full overflow-hidden">
      <AccordionPrimitive.Trigger
        onClick={handleClick}
        className={cn(`flex items-center gap-1 rounded-md text-base py-1.5 px-1`, className, {
          "bg-muted rounded-md": isSelect && isSelectable,
          "cursor-pointer": isSelectable,
          "cursor-not-allowed opacity-50": !isSelectable,
        })}
        disabled={!isSelectable}>
        {element}
      </AccordionPrimitive.Trigger>
      <AccordionPrimitive.Content
        className="relative h-full overflow-hidden text-base pl-7 border-l-2 border-gray-200 ml-3 mt-1 py-1 data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
        {children}
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
});

Folder.propTypes = {
  className: PropTypes.string,
  element: PropTypes.node.isRequired,
  value: PropTypes.string.isRequired,
  isSelectable: PropTypes.bool,
  isSelect: PropTypes.bool,
  onSelect: PropTypes.func,
  children: PropTypes.node
};

Folder.displayName = "Folder";

const FileItem = forwardRef(function FileItem(
  {
    value,
    className,
    handleSelect,
    isSelectable = true,
    isSelect,
    children,
    ...props
  },
  ref
) {
  const { direction, selectedId, selectItem } = useTree();
  const isSelected = isSelect ?? selectedId === value;
  return (
    <div
      {...props}
      ref={ref}
      dir={direction}
      onClick={() => {
        if (!isSelectable) return;
        if (selectItem) selectItem(value);
        if (handleSelect) handleSelect(value);
      }}
      className={cn(
        "flex cursor-pointer items-center gap-1 rounded-md text-base py-1.5 relative",
        className,
        {
            "bg-muted": isSelected && isSelectable,
            "cursor-not-allowed opacity-50": !isSelectable,
        }
      )}>
      <div >{children}</div>
    </div>
  );
});

FileItem.propTypes = {
  value: PropTypes.string.isRequired,
  className: PropTypes.string,
  handleSelect: PropTypes.func,
  isSelectable: PropTypes.bool,
  isSelect: PropTypes.bool,
  children: PropTypes.node
};

FileItem.displayName = "FileItem";

const CollapseButton = forwardRef(function CollapseButton(
  { elements, expandAll = false, children, ...props },
  ref
) {
  const { expandedItems, setExpandedItems } = useTree();

  const expendAllTree = useCallback((elements) => {
    const expandTree = (element) => {
      const isSelectable = element.isSelectable ?? true;
      if (isSelectable && element.children && element.children.length > 0) {
        setExpandedItems?.((prev) => [...(prev ?? []), element.id]);
        element.children.forEach(expandTree);
      }
    };

    elements.forEach(expandTree);
  }, [setExpandedItems]);

  const closeAll = useCallback(() => {
    setExpandedItems?.([]);
  }, [setExpandedItems]);

  useEffect(() => {
    if (expandAll) {
      expendAllTree(elements);
    }
  }, [expandAll, elements, expendAllTree]);

  return (
    (<Button
      variant={"ghost"}
      className="absolute bottom-1 right-2 h-8 w-fit p-1"
      onClick={
        expandedItems && expandedItems.length > 0
          ? closeAll
          : () => expendAllTree(elements)
      }
      ref={ref}
      {...props}>
      {children}
      <span className="sr-only">Toggle</span>
    </Button>)
  );
});

CollapseButton.propTypes = {
  className: PropTypes.string,
  elements: PropTypes.array,
  expandAll: PropTypes.bool,
  children: PropTypes.node
};

CollapseButton.displayName = "CollapseButton";

export { CollapseButton, FileItem as File, Folder, Tree };
