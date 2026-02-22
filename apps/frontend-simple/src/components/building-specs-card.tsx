"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Building } from 'lucide-react'
import { motion } from 'framer-motion'
import { type BuildingData } from '@/lib/api'

interface BuildingSpecsCardProps {
    buildingData: BuildingData
    onBuildingChange: (field: keyof BuildingData, value: any) => void
}

export function BuildingSpecsCard({ buildingData, onBuildingChange }: BuildingSpecsCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
        >
            <Card className="shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Building Specifications
                    </CardTitle>
                    <CardDescription>
                        Building characteristics (same for all hours)
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="floorArea">Floor Area (m²)</Label>
                            <Input
                                id="floorArea"
                                type="number"
                                value={buildingData.floorArea}
                                onChange={(e) => onBuildingChange('floorArea', parseFloat(e.target.value))}
                                onBlur={(e) => onBuildingChange('floorArea', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="numFloors">Number of Floors</Label>
                            <Input
                                id="numFloors"
                                type="number"
                                value={buildingData.numFloors}
                                onChange={(e) => onBuildingChange('numFloors', parseInt(e.target.value))}
                                min="1"
                                max="10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="infiltrationRate">Infiltration Rate (ACH)</Label>
                            <Input
                                id="infiltrationRate"
                                type="number"
                                value={buildingData.infiltrationRate}
                                onChange={(e) => onBuildingChange('infiltrationRate', parseFloat(e.target.value))}
                                onBlur={(e) => onBuildingChange('infiltrationRate', Number(parseFloat(e.target.value).toFixed(2)))}
                                step="0.01"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="buildingType">Building Type</Label>
                            <Select
                                value={buildingData.buildingType}
                                onValueChange={(value) => onBuildingChange('buildingType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="detached">Detached House</SelectItem>
                                    <SelectItem value="end_terrace">End Terrace</SelectItem>
                                    <SelectItem value="mid_terrace">Mid Terrace</SelectItem>
                                    <SelectItem value="bungalow">Bungalow</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="constructionType">Construction Type</Label>
                            <Select
                                value={buildingData.constructionType}
                                onValueChange={(value) => onBuildingChange('constructionType', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="standard">Standard</SelectItem>
                                    <SelectItem value="terrace">Terrace</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}
