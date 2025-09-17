import { Building2, CircuitBoard, Factory, Zap } from "lucide-react"
import PropTypes from "prop-types"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { File, Folder, Tree } from "../../magicui/file-tree"
import { cn } from "@/lib/utils"
// import Employees from "../../../pages/Employees"

// Custom components with specific icons
const Substation = ({ children, value, element, onSelect, isSelected }) => {
    return (
        <Folder 
            value={value} 
            element={
                <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    <span>{element}</span>
                </div>
            }
            onSelect={() => onSelect(element)}
            className={cn('hover:bg-gray-100/50 transition-colors', {
                'bg-gray-100 shadow-sm': isSelected
            })}>
            {children}
        </Folder>
    )
}

Substation.propTypes = {
    children: PropTypes.node,
    value: PropTypes.string.isRequired,
    element: PropTypes.string.isRequired,
    onSelect: PropTypes.func.isRequired,
    isSelected: PropTypes.bool
}

const Transformer = ({ children, value, element }) => {
    return (
        <Folder 
            value={value} 
            element={
                <div className="flex items-center gap-3">
                    <Factory className="h-5 w-5 text-green-500" />
                    <span>{element}</span>
                </div>
            }>
            {children}
        </Folder>
    )
}

Transformer.propTypes = {
    children: PropTypes.node,
    value: PropTypes.string.isRequired,
    element: PropTypes.string.isRequired
}

const Area = ({ value, name }) => {
    return (
        <File value={value}>
            <div className="flex items-center gap-3">
                <CircuitBoard className="h-5 w-5 text-amber-500" />
                <p>{name}</p>
            </div>
        </File>
    )
}

Area.propTypes = {
    value: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired
}


export default function CustomSubstationTree() {
    const navigate = useNavigate();
    const [selectedSubstation, setSelectedSubstation] = useState(null);

    const handleSubstationSelect = (substationName) => {
        setSelectedSubstation(substationName);
        navigate(`/dashboard/${substationName.toLowerCase().replace(/ /g, "-")}`);
    }

    return (
        <div className="grid h-screen grid-cols-[350px_1fr] divide-x">
            <div className="flex h-full flex-col overflow-y-auto border-r bg-background/95 p-6">

                <div className="mb-6 flex items-center gap-3">
                    <Zap className="h-7 w-7 text-amber-500" />
                    <h2 className="text-2xl font-semibold">Power Distribution Network</h2>
                </div>

            <Tree
                className="w-full overflow-hidden rounded-lg bg-background/50 p-4 shadow-sm"
                defaultExpanded={true}
                initialExpandedItems={["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"]}
            >
                {/* North Substation */}
                <Substation element="North Substation" value="1" onSelect={handleSubstationSelect} isSelected={selectedSubstation === "North Substation"}>
                    {/* Main Transformer */}
                    <Transformer value="2" element="Main Transformer">
                        <Area value="3" name="Residential Area" />
                        <Area value="4" name="Commercial Area" />
                    </Transformer>

                    {/* Backup Transformer */}
                    <Transformer value="5" element="Backup Transformer">
                        <Area value="6" name="Industrial Area" />
                    </Transformer>
                </Substation>

                {/* South Substation */}
                <Substation element="South Substation" value="7" onSelect={handleSubstationSelect} isSelected={selectedSubstation === "South Substation"}>
                    {/* Primary Transformer */}
                    <Transformer value="8" element="Primary Transformer">
                        <Area value="9" name="Downtown Area" />
                        <Area value="10" name="Suburban Area" />
                    </Transformer>

                    {/* Secondary Transformer */}
                    <Transformer value="11" element="Secondary Transformer">
                        <Area value="12" name="Rural Area" />
                    </Transformer>
                </Substation>

                {/* East Substation */}
                <Substation element="East Substation" value="13" onSelect={handleSubstationSelect}>
                    {/* High Voltage Transformer */}
                    <Transformer value="14" element="High Voltage Transformer">
                        <Area value="15" name="Manufacturing Zone" />
                        <Area value="16" name="Office Complex" />
                    </Transformer>
                </Substation>
            </Tree>
            </div>
            {/* <div className="p-4 overflow-y-auto">
                <Employees />
            </div> */}
        </div>
    )
}
