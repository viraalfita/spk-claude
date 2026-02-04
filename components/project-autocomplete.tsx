"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface Project {
  project_name: string;
  project_description: string | null;
}

interface ProjectAutocompleteProps {
  value: string;
  onChange: (project: Project) => void;
  projects: Project[];
}

export function ProjectAutocomplete({
  value,
  onChange,
  projects,
}: ProjectAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
    if (value) {
      const matchedProject = projects.find((p) => p.project_name === value);
      if (matchedProject) {
        setIsSelected(true);
        setSelectedProject(matchedProject);
      }
    }
  }, [value, projects]);

  useEffect(() => {
    if (!isSelected && inputValue) {
      const filtered = projects.filter((p) =>
        p.project_name.toLowerCase().includes(inputValue.toLowerCase()),
      );
      setFilteredProjects(filtered);
      setIsOpen(filtered.length > 0 && inputValue.length > 0);
    } else {
      setFilteredProjects([]);
      setIsOpen(false);
    }
  }, [inputValue, projects, isSelected]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setIsSelected(false);
    setSelectedProject(null);
    onChange({
      project_name: newValue,
      project_description: null,
    });
  };

  const handleSelectProject = (project: Project) => {
    setInputValue(project.project_name);
    setIsOpen(false);
    setIsSelected(true);
    setSelectedProject(project);
    onChange(project);
  };

  const handleClearSelection = () => {
    setInputValue("");
    setIsSelected(false);
    setSelectedProject(null);
    onChange({
      project_name: "",
      project_description: null,
    });
  };

  if (isSelected && selectedProject) {
    return (
      <div ref={wrapperRef}>
        <Label htmlFor="projectName">Project Name *</Label>
        <div className="mt-1 flex items-center gap-2 p-3 bg-gray-50 border border-gray-200 rounded-md">
          <div className="flex-1">
            <div className="font-medium">{selectedProject.project_name}</div>
            {selectedProject.project_description && (
              <div className="text-sm text-gray-600">
                {selectedProject.project_description}
              </div>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClearSelection}
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear selection</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="relative">
      <Label htmlFor="projectName">
        Project Name *
        <span className="text-xs text-gray-500 font-normal ml-2">
          (Type to search history)
        </span>
      </Label>
      <Input
        id="projectName"
        name="projectName"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={() => {
          if (inputValue && filteredProjects.length > 0) {
            setIsOpen(true);
          }
        }}
        required
        placeholder="Office Renovation Phase 1"
        autoComplete="off"
      />

      {/* Dropdown */}
      {isOpen && filteredProjects.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {filteredProjects.map((project, index) => (
            <button
              key={index}
              type="button"
              onClick={() => handleSelectProject(project)}
              className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
            >
              <div className="font-medium">{project.project_name}</div>
              {project.project_description && (
                <div className="text-sm text-gray-600">
                  {project.project_description}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Show hint if no results */}
      {isOpen && filteredProjects.length === 0 && inputValue && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg px-4 py-2 text-sm text-gray-500">
          No previous projects found. New project will be saved.
        </div>
      )}
    </div>
  );
}
