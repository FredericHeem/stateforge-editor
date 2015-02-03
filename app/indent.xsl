<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="xml" encoding="ISO-8859-1"/>
    <xsl:param name="indent-increment" select="'    '"/>

    <xsl:template name="newline">
        <xsl:text>&#xa;</xsl:text>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:param name="indent" select="''"/>
        <xsl:call-template name="newline"/>
        <xsl:value-of select="$indent"/>
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template>

    <xsl:template match="text()[normalize-space(.)='']"/>

    <xsl:template match="* | comment()">
        <xsl:param name="indent" select="''"/>
        <xsl:call-template name="newline"/>
        <xsl:value-of select="$indent"/>
        <xsl:choose>
            <xsl:when test="count(child::*) > 0">
                <xsl:copy>
                    <xsl:copy-of select="@*"/>
                    <xsl:apply-templates select="*|text()| comment()">
                        <xsl:with-param name="indent" select="concat ($indent, $indent-increment)"/>
                    </xsl:apply-templates>
                    <xsl:call-template name="newline"/>
                    <xsl:value-of select="$indent"/>
                </xsl:copy>
            </xsl:when>
            <xsl:otherwise>
                <xsl:copy-of select="."/>
            </xsl:otherwise>
        </xsl:choose>
    </xsl:template>

    <xsl:template match="comment() | processing-instruction()">
        <xsl:param name="indent" select="''"/>
        <xsl:call-template name="newline"/>
        <xsl:value-of select="$indent"/>
        <xsl:copy />
    </xsl:template>
</xsl:stylesheet>

